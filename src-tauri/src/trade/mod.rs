//! Trade tools (外贸工具坞): fx rates and the AI trade writer. Each concern in its own file;
//! this file lists the module's commands (子模块的命令也列在顶层模块里).

pub(crate) mod fx;
pub(crate) mod writer;

macro_rules! tauri_commands {
    ($next:ident [$($done:tt)*] $($rest:tt)*) => {
        $next!([$($done)*
            crate::trade::fx::get_fx_rates,
            crate::trade::writer::compose_trade_text,
        ] $($rest)*)
    };
}

pub(crate) use tauri_commands;
