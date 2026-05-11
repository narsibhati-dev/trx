use crate::ui::{draw::draw_ui, input::InputMode};

use color_eyre::Result;
use ratatui::{
    DefaultTerminal,
    crossterm::event::{self, Event, KeyCode, KeyEventKind},
    widgets::ListState,
};
use std::collections::HashSet;
use std::sync::mpsc::{Receiver, Sender};
use std::thread;
use std::time::{Duration, Instant};

use crate::managers::{self, Package};

#[derive(Debug, Clone, Copy, PartialEq)]
pub enum Tab {
    Search,
    Installed,
    Updates,
}

pub struct App {
    pub input: String,
    pub character_index: usize,
    pub input_mode: InputMode,
    pub current_tab: Tab,
    pub packages: Vec<Package>,
    pub checked: Vec<bool>,
    pub selected_names: HashSet<String>,
    pub installed_packages: HashSet<String>,
    pub selected: usize,
    pub list_state: ListState,
    pub messages: Vec<String>,
    pub loading: bool,
    pub details: Option<std::collections::HashMap<String, String>>,
    pub last_selected: usize,
    pub config: crate::config::Config,
    pub show_help: bool,
    result_tx: Sender<Vec<Package>>,
    result_rx: Receiver<Vec<Package>>,
    details_tx: Sender<Option<std::collections::HashMap<String, String>>>,
    details_rx: Receiver<Option<std::collections::HashMap<String, String>>>,
    last_input_time: Instant,
    pending_search: bool,
    last_search_query: String,
}

impl App {
    pub fn new(result_tx: Sender<Vec<Package>>, result_rx: Receiver<Vec<Package>>) -> Self {
        let mut list_state = ListState::default();
        list_state.select(None);

        let (details_tx, details_rx) = std::sync::mpsc::channel();

        Self {
            input: String::new(),
            input_mode: InputMode::Normal,
            current_tab: Tab::Search,
            messages: Vec::new(),
            character_index: 0,
            packages: Vec::new(),
            checked: Vec::new(),
            selected_names: HashSet::new(),
            installed_packages: managers::pacman::get_installed_packages(),
            selected: 0,
            list_state,
            loading: false,
            details: None,
            last_selected: usize::MAX,
            config: crate::config::Config::load(),
            show_help: false,
            result_tx,
            result_rx,
            details_tx,
            details_rx,
            last_input_time: Instant::now(),
            pending_search: false,
            last_search_query: String::new(),
        }
    }

    fn move_cursor_left(&mut self) {
        let new_index = self.character_index.saturating_sub(1);
        self.character_index = self.clamp_cursor(new_index);
    }

    fn move_cursor_right(&mut self) {
        let new_index = self.character_index.saturating_add(1);
        self.character_index = self.clamp_cursor(new_index);
    }

    fn byte_index(&self) -> usize {
        self.input
            .char_indices()
            .map(|(i, _)| i)
            .nth(self.character_index)
            .unwrap_or(self.input.len())
    }

    fn clamp_cursor(&self, new_pos: usize) -> usize {
        new_pos.clamp(0, self.input.chars().count())
    }

    fn enter_char(&mut self, new_char: char) {
        let index = self.byte_index();
        self.input.insert(index, new_char);
        self.move_cursor_right();

        self.last_input_time = Instant::now();
        self.pending_search = true;
    }

    fn delete_char(&mut self) {
        if self.character_index != 0 {
            let left = self.character_index - 1;
            let before = self.input.chars().take(left);
            let after = self.input.chars().skip(self.character_index);
            self.input = before.chain(after).collect();
            self.move_cursor_left();

            self.last_input_time = Instant::now();
            self.pending_search = true;
        }
    }

    fn check_and_execute_search(&mut self) {
        const DEBOUNCE_MS: u64 = 50;

        if self.pending_search
            && self.last_input_time.elapsed() >= Duration::from_millis(DEBOUNCE_MS)
        {
            let query = self.input.trim().to_string();

            if !query.is_empty() && query != self.last_search_query {
                self.last_search_query = query.clone();
                self.pending_search = false;
                self.loading = true;

                let tx = self.result_tx.clone();
                let aur_helper = self.config.aur_helper.clone();

                thread::spawn(move || {
                    // spawn pacman search
                    let pac_handle = thread::spawn({
                        let q = query.clone();
                        move || managers::pacman::search_pacman(&q)
                    });

                    let aur_handle = thread::spawn({
                        let q = query.clone();
                        move || managers::yay::search_aur(&q, &aur_helper)
                    });

                    // get pacman results

                    let mut all = pac_handle.join().unwrap_or_default();
                    all.extend(aur_handle.join().unwrap_or_default());

                    all.sort_by(|a, b| {
                        b.score
                            .partial_cmp(&a.score)
                            .unwrap_or(std::cmp::Ordering::Equal)
                    });

                    // keep only top 50
                    all.truncate(50);

                    let _ = tx.send(all);
                });
            } else if query.is_empty() {
                self.pending_search = false;
                self.packages.clear();
                self.messages.clear();
                self.loading = false;
            }
        }
    }
    fn run_command(
        &self,
        terminal: &mut DefaultTerminal,
    ) -> Result<(), Box<dyn std::error::Error>> {
        if self.selected_names.is_empty() {
            return Ok(());
        }

        let mut pacman_pkgs = HashSet::new();
        let mut aur_pkgs = HashSet::new();

        for name in &self.selected_names {
            if let Some(pkg) = self.packages.iter().find(|p| p.name == *name) {
                match pkg.provider.as_str() {
                    "pacman" => {
                        pacman_pkgs.insert(name.clone());
                    }
                    "aur" => {
                        aur_pkgs.insert(name.clone());
                    }
                    _ => {}
                }
            }
        }

        if !pacman_pkgs.is_empty() {
            managers::pacman::pacman_install(terminal, &pacman_pkgs)?;
        }

        if !aur_pkgs.is_empty() {
            managers::yay::aur_install(terminal, &aur_pkgs, &self.config.aur_helper)?;
        }

        Ok(())
    }

    fn switch_tab(&mut self) {
        self.current_tab = match self.current_tab {
            Tab::Search => Tab::Installed,
            Tab::Installed => Tab::Updates,
            Tab::Updates => Tab::Search,
        };

        match self.current_tab {
            Tab::Search => {
                self.packages.clear();
                self.pending_search = true;
            }
            Tab::Installed => {
                self.loading = true;
                self.packages = managers::pacman::get_installed_packages_details();
                self.loading = false;
                self.selected = 0;
                self.list_state.select(Some(0));
            }
            Tab::Updates => {
                self.loading = true;
                self.packages = managers::pacman::get_updates();
                self.loading = false;
                self.selected = 0;
                self.list_state.select(Some(0));
            }
        }

        self.checked = self
            .packages
            .iter()
            .map(|p| self.selected_names.contains(&p.name))
            .collect();
    }

    fn trigger_details_fetch(&mut self) {
        if self.packages.is_empty() || self.selected >= self.packages.len() {
            return;
        }

        if self.selected == self.last_selected {
            return;
        }

        let pkg = self.packages[self.selected].clone();
        let tx = self.details_tx.clone();
        self.last_selected = self.selected;
        self.details = None; // clear current details to show loading

        thread::spawn(move || {
            let info = managers::details_package(&pkg.name, &pkg.provider);
            let _ = tx.send(info);
        });
    }

    pub fn run(mut self, terminal: &mut DefaultTerminal) -> Result<()> {
        loop {
            if let Tab::Search = self.current_tab {
                self.check_and_execute_search();
            }

            // check search results
            if let Ok(pkgs) = self.result_rx.try_recv() {
                if let Tab::Search = self.current_tab {
                    self.packages = pkgs;

                    self.checked = self
                        .packages
                        .iter()
                        .map(|p| self.selected_names.contains(&p.name))
                        .collect();

                    self.selected = 0;
                    self.last_selected = usize::MAX; // Reset to trigger details for first item
                    self.loading = false;

                    if !self.packages.is_empty() {
                        self.list_state.select(Some(0));
                        self.trigger_details_fetch();
                    } else {
                        self.list_state.select(None);
                        self.details = None;
                    }

                    self.messages = self
                        .packages
                        .iter()
                        .map(|p| format!("{} {:<15} {}", p.name, p.version, p.description))
                        .collect();
                }
            }

            // check details results
            if let Ok(details) = self.details_rx.try_recv() {
                self.details = details;
            }

            terminal.draw(|frame| draw_ui(frame, &mut self))?;

            if event::poll(std::time::Duration::from_millis(10))? {
                if let Event::Key(key) = event::read()? {
                    match self.input_mode {
                        InputMode::Normal if key.kind == KeyEventKind::Press => match key.code {
                            KeyCode::Tab => {
                                self.switch_tab();
                                self.last_selected = usize::MAX;
                                self.trigger_details_fetch();
                            }
                            KeyCode::Char('i') => {
                                let _ = self.run_command(terminal);
                                // Refresh installed status after install
                                self.installed_packages = managers::pacman::get_installed_packages();
                            }
                            KeyCode::Char(' ') => {
                                if !self.packages.is_empty() {
                                    let pkg = &self.packages[self.selected];
                                    let name = pkg.name.clone();

                                    let is_checked = !self.checked[self.selected];
                                    self.checked[self.selected] = is_checked;

                                    if is_checked {
                                        self.selected_names.insert(name);
                                    } else {
                                        self.selected_names.remove(&name);
                                    }
                                }
                            }
                            KeyCode::Char('e') => self.input_mode = InputMode::Editing,
                            KeyCode::Char('q') => return Ok(()),
                            KeyCode::Char('?') => self.show_help = !self.show_help,

                            KeyCode::Up | KeyCode::Char('k') => {
                                if self.selected > 0 {
                                    self.selected -= 1;
                                    self.list_state.select(Some(self.selected));
                                    self.trigger_details_fetch();
                                }
                            }
                            KeyCode::Down | KeyCode::Char('j') => {
                                if self.selected + 1 < self.packages.len() {
                                    self.selected += 1;
                                    self.list_state.select(Some(self.selected));
                                    self.trigger_details_fetch();
                                }
                            }
                            _ => {}
                        },

                        InputMode::Editing if key.kind == KeyEventKind::Press => match key.code {
                            KeyCode::Enter => {
                                self.input_mode = InputMode::Normal;
                                self.pending_search = true;
                                self.last_input_time = Instant::now();
                            }
                            KeyCode::Char(c) => self.enter_char(c),
                            KeyCode::Backspace => self.delete_char(),
                            KeyCode::Left => self.move_cursor_left(),
                            KeyCode::Right => self.move_cursor_right(),
                            KeyCode::Esc => self.input_mode = InputMode::Normal,
                            _ => {}
                        },

                        _ => {}
                    }
                }
            }
        }
    }
}
