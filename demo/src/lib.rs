//! "You be the cat": the playable demo on the Paw Party site.
//!
//! `game` holds the rules and has no browser dependencies. `web` draws the game on a
//! canvas and is only compiled for WebAssembly.

pub mod game;

#[cfg(target_arch = "wasm32")]
mod web;
