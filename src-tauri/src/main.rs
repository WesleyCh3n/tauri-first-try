#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use tauri::{api::dialog, CustomMenuItem, Menu, MenuItem, Submenu};

#[tauri::command]
fn hello(name: String) -> String {
    format!("Hello {}", name)
}

#[tauri::command]
fn open_dialog() {
    dialog::FileDialogBuilder::default().pick_file(|path_buf| {
        if let Some(path) = path_buf {
            println!("{:?}", path);
        }
    });
}

fn main() {
    let open = CustomMenuItem::new("open".to_string(), "Open");
    let file_menu = Submenu::new("File", Menu::new().add_item(open));
    let menu = Menu::new()
        .add_submenu(file_menu)
        .add_native_item(MenuItem::Separator)
        .add_native_item(MenuItem::Quit);

    tauri::Builder::default()
        .menu(menu)
        .on_menu_event(|event| match event.menu_item_id() {
            "open" => {
                /* dialog::FileDialogBuilder::default().pick_file(|path_buf| {
                    match path_buf {
                        Some(_p) => {}
                        _ => {}
                    }
                }); */
            }
            _ => {}
        })
        .invoke_handler(tauri::generate_handler![hello, open_dialog])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
