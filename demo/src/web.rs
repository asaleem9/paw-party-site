//! Draws the game on a 2D canvas. The page owns the animation loop and the pointer events;
//! this side owns the rules and every pixel.

use std::f64::consts::{FRAC_PI_2, TAU};

use wasm_bindgen::prelude::*;
use web_sys::{CanvasRenderingContext2d, HtmlCanvasElement, HtmlImageElement};

use crate::game::{Effect, EffectKind, Game};

#[wasm_bindgen]
pub struct Demo {
    game: Game,
    canvas: HtmlCanvasElement,
    context: CanvasRenderingContext2d,
    floor: HtmlImageElement,
    mice: Vec<HtmlImageElement>,
    scale: f64,
}

#[wasm_bindgen]
impl Demo {
    /// `mice` is an array of loaded images, each a top-down mouse facing up.
    #[wasm_bindgen(constructor)]
    pub fn new(canvas: HtmlCanvasElement, floor: HtmlImageElement, mice: js_sys::Array, seed: f64) -> Result<Demo, JsValue> {
        let context = canvas
            .get_context("2d")?
            .ok_or_else(|| JsValue::from_str("this browser has no 2D canvas"))?
            .dyn_into::<CanvasRenderingContext2d>()?;
        let mice: Vec<HtmlImageElement> = mice.iter().filter_map(|value| value.dyn_into().ok()).collect();
        if mice.is_empty() {
            return Err(JsValue::from_str("the demo needs at least one mouse image"));
        }
        let game = Game::new(seed as u64, 1.0, 1.0, mice.len());
        Ok(Demo { game, canvas, context, floor, mice, scale: 1.0 })
    }

    /// Call when the canvas changes size. `width` and `height` are CSS pixels.
    pub fn resize(&mut self, width: f64, height: f64, device_pixel_ratio: f64) {
        self.scale = device_pixel_ratio.clamp(1.0, 3.0);
        self.canvas.set_width((width * self.scale).round() as u32);
        self.canvas.set_height((height * self.scale).round() as u32);
        self.game.resize(width as f32, height as f32);
    }

    /// Advances the game by `seconds` and redraws.
    pub fn frame(&mut self, seconds: f64) {
        self.game.update(seconds as f32);
        self.draw();
    }

    /// A tap or click at CSS pixel (x, y) inside the canvas. Returns true on a catch.
    pub fn tap(&mut self, x: f64, y: f64) -> bool {
        self.game.tap(x as f32, y as f32)
    }

    #[wasm_bindgen(getter)]
    pub fn score(&self) -> u32 {
        self.game.score
    }

    #[wasm_bindgen(getter)]
    pub fn catches(&self) -> u32 {
        self.game.catches
    }

    #[wasm_bindgen(getter)]
    pub fn misses(&self) -> u32 {
        self.game.misses
    }

    /// Centre of the first mouse, as [x, y] in CSS pixels, or an empty array. Used by tests.
    pub fn first_mouse(&self) -> Vec<f32> {
        self.game.mice.first().map(|mouse| vec![mouse.x, mouse.y]).unwrap_or_default()
    }
}

impl Demo {
    fn draw(&self) {
        let c = &self.context;
        let (width, height) = (self.game.width as f64, self.game.height as f64);
        let _ = c.set_transform(self.scale, 0.0, 0.0, self.scale, 0.0, 0.0);

        self.draw_floor(width, height);
        for effect in self.game.effects.iter().filter(|e| e.kind == EffectKind::Paw) {
            self.draw_paw(effect);
        }
        for mouse in &self.game.mice {
            let image = &self.mice[mouse.kind.min(self.mice.len() - 1)];
            let length = self.game.mouse_length() as f64;
            let aspect = image.natural_width() as f64 / (image.natural_height() as f64).max(1.0);
            let (w, h) = (length * aspect, length);
            let wiggle = if mouse.moving { (mouse.phase as f64 * 2.6).sin() } else { 0.0 };

            // Soft shadow under the body.
            c.save();
            let _ = c.translate(mouse.x as f64 + 4.0, mouse.y as f64 + 7.0);
            let _ = c.rotate(mouse.heading as f64 + FRAC_PI_2);
            c.set_fill_style_str("rgba(0, 0, 0, 0.22)");
            c.begin_path();
            let _ = c.ellipse(0.0, -h * 0.12, w * 0.34, h * 0.3, 0.0, 0.0, TAU);
            c.fill();
            c.restore();

            c.save();
            let _ = c.translate(mouse.x as f64, mouse.y as f64);
            // Art faces up, so add a quarter turn to line it up with the heading.
            let _ = c.rotate(mouse.heading as f64 + FRAC_PI_2 + wiggle * 0.07);
            let _ = c.scale(1.0 + wiggle * 0.03, 1.0 - wiggle * 0.03);
            let _ = c.draw_image_with_html_image_element_and_dw_and_dh(image, -w / 2.0, -h / 2.0, w, h);
            c.restore();
        }
        for effect in &self.game.effects {
            match effect.kind {
                EffectKind::Burst => self.draw_burst(effect),
                EffectKind::Points => self.draw_points(effect),
                EffectKind::Paw => {}
            }
        }
    }

    /// Fills the canvas with the floor image, cropped to cover.
    fn draw_floor(&self, width: f64, height: f64) {
        let c = &self.context;
        let (iw, ih) = (self.floor.natural_width() as f64, self.floor.natural_height() as f64);
        if iw < 1.0 || ih < 1.0 {
            c.set_fill_style_str("#b98a55");
            c.fill_rect(0.0, 0.0, width, height);
            return;
        }
        let scale = (width / iw).max(height / ih);
        let (sw, sh) = (width / scale, height / scale);
        let _ = c.draw_image_with_html_image_element_and_sw_and_sh_and_dx_and_dy_and_dw_and_dh(
            &self.floor,
            (iw - sw) / 2.0,
            (ih - sh) / 2.0,
            sw,
            sh,
            0.0,
            0.0,
            width,
            height,
        );
    }

    fn draw_paw(&self, effect: &Effect) {
        let c = &self.context;
        let size = self.game.mouse_length() as f64 * 0.42;
        c.save();
        let _ = c.translate(effect.x as f64, effect.y as f64);
        let _ = c.rotate(effect.angle as f64);
        c.set_global_alpha(0.42 * (1.0 - effect.progress() as f64));
        c.set_fill_style_str("#0b0d10");
        c.begin_path();
        let _ = c.ellipse(0.0, size * 0.18, size * 0.36, size * 0.3, 0.0, 0.0, TAU);
        for (x, y) in [(-0.4, -0.12), (-0.15, -0.4), (0.15, -0.4), (0.4, -0.12)] {
            let _ = c.ellipse(size * x, size * y, size * 0.13, size * 0.17, 0.0, 0.0, TAU);
        }
        c.fill();
        c.restore();
    }

    fn draw_burst(&self, effect: &Effect) {
        let c = &self.context;
        let t = effect.progress() as f64;
        let reach = self.game.mouse_length() as f64 * (0.25 + 0.75 * t);
        c.save();
        c.set_global_alpha(1.0 - t);
        c.set_fill_style_str("#fff303");
        for index in 0..12 {
            let angle = index as f64 / 12.0 * TAU + 0.3;
            let radius = 5.0 * (1.0 - t) + 2.0;
            c.begin_path();
            let _ = c.arc(effect.x as f64 + angle.cos() * reach, effect.y as f64 + angle.sin() * reach, radius, 0.0, TAU);
            c.fill();
        }
        c.restore();
    }

    fn draw_points(&self, effect: &Effect) {
        let c = &self.context;
        let t = effect.progress() as f64;
        let y = effect.y as f64 - 26.0 - 34.0 * t;
        c.save();
        c.set_global_alpha(if t < 0.5 { 1.0 } else { 2.0 * (1.0 - t) });
        c.set_font("800 26px ui-rounded, system-ui, sans-serif");
        c.set_text_align("center");
        let text = format!("+{}", effect.value);
        c.set_fill_style_str("rgba(0, 0, 0, 0.55)");
        let _ = c.fill_text(&text, effect.x as f64 + 1.5, y + 2.0);
        c.set_fill_style_str(if effect.value > 10 { "#fff303" } else { "#ffffff" });
        let _ = c.fill_text(&text, effect.x as f64, y);
        c.restore();
    }
}
