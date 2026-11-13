//! The rules of the demo: mice that dart, freeze and bolt, and a paw that tries to catch them.
//! Sizes are in CSS pixels. Nothing here touches the browser, so it runs under `cargo test`.

use std::f32::consts::PI;

/// Small deterministic generator. The same seed always plays the same game, which keeps
/// the tests honest.
pub struct Rng(u64);

impl Rng {
    pub fn new(seed: u64) -> Self {
        Rng(seed.wrapping_mul(0x9E37_79B9_7F4A_7C15) | 1)
    }

    /// A value in 0..1.
    pub fn unit(&mut self) -> f32 {
        let mut x = self.0;
        x ^= x << 13;
        x ^= x >> 7;
        x ^= x << 17;
        self.0 = x;
        ((x >> 40) as f32) / ((1u64 << 24) as f32)
    }

    pub fn range(&mut self, low: f32, high: f32) -> f32 {
        low + (high - low) * self.unit()
    }
}

#[derive(Clone, Copy, PartialEq, Debug)]
pub enum State {
    /// Running in a burst.
    Dart,
    /// Frozen, deciding where to go next.
    Rest,
    /// Bolting away from a paw that just missed.
    Flee,
    /// Heading off screen for good.
    Leave,
}

#[derive(Clone, Debug)]
pub struct Mouse {
    pub x: f32,
    pub y: f32,
    /// Direction of travel in radians, screen coordinates (y grows downward).
    pub heading: f32,
    pub state: State,
    /// Which sprite to draw.
    pub kind: usize,
    /// Drives the running wiggle.
    pub phase: f32,
    pub moving: bool,
    timer: f32,
    life: f32,
}

#[derive(Clone, Copy, PartialEq, Debug)]
pub enum EffectKind {
    /// Puff where a mouse was caught.
    Burst,
    /// Paw print where a tap hit nothing.
    Paw,
    /// Floating "+10".
    Points,
}

#[derive(Clone, Debug)]
pub struct Effect {
    pub kind: EffectKind,
    pub x: f32,
    pub y: f32,
    pub age: f32,
    pub value: u32,
    pub angle: f32,
}

impl Effect {
    pub const LIFE: f32 = 0.7;

    /// 0 when it appears, 1 when it is gone.
    pub fn progress(&self) -> f32 {
        (self.age / Self::LIFE).min(1.0)
    }
}

pub struct Game {
    pub width: f32,
    pub height: f32,
    pub mice: Vec<Mouse>,
    pub effects: Vec<Effect>,
    pub score: u32,
    pub catches: u32,
    pub misses: u32,
    /// How many mice have come out so far.
    pub spawned: u32,
    combo: u32,
    since_catch: f32,
    spawn_timer: f32,
    kinds: usize,
    rng: Rng,
}

impl Game {
    pub const MAX_MICE: usize = 4;
    const COMBO_WINDOW: f32 = 3.0;

    /// `kinds` is how many different mouse sprites are available.
    pub fn new(seed: u64, width: f32, height: f32, kinds: usize) -> Self {
        Game {
            width: width.max(1.0),
            height: height.max(1.0),
            mice: Vec::new(),
            effects: Vec::new(),
            score: 0,
            catches: 0,
            misses: 0,
            spawned: 0,
            combo: 0,
            since_catch: f32::MAX,
            spawn_timer: 0.0,
            kinds: kinds.max(1),
            rng: Rng::new(seed),
        }
    }

    fn unit(&self) -> f32 {
        self.width.min(self.height)
    }

    /// Nose to tail, on screen.
    pub fn mouse_length(&self) -> f32 {
        (self.unit() * 0.36).clamp(80.0, 230.0)
    }

    /// How close a tap has to be. Generous, like the app.
    pub fn hit_radius(&self) -> f32 {
        self.mouse_length() * 0.56
    }

    /// Gets quicker as the player catches more, up to a limit.
    pub fn pace(&self) -> f32 {
        (0.8 + 0.035 * self.catches as f32).min(1.6)
    }

    /// One mouse to begin with, another for every four catches.
    pub fn target_count(&self) -> usize {
        (1 + self.catches as usize / 4).min(Self::MAX_MICE)
    }

    /// Points multiplier from quick successive catches.
    pub fn multiplier(&self) -> u32 {
        (1 + self.combo / 3).min(5)
    }

    pub fn resize(&mut self, width: f32, height: f32) {
        let (width, height) = (width.max(1.0), height.max(1.0));
        let (sx, sy) = (width / self.width, height / self.height);
        for mouse in &mut self.mice {
            mouse.x *= sx;
            mouse.y *= sy;
        }
        for effect in &mut self.effects {
            effect.x *= sx;
            effect.y *= sy;
        }
        self.width = width;
        self.height = height;
    }

    pub fn update(&mut self, dt: f32) {
        let dt = dt.clamp(0.0, 0.05);
        self.since_catch += dt;
        if self.since_catch > Self::COMBO_WINDOW {
            self.combo = 0;
        }

        for effect in &mut self.effects {
            effect.age += dt;
        }
        self.effects.retain(|effect| effect.age < Effect::LIFE);

        let speed = self.unit() * 0.6 * self.pace();
        let pace = self.pace();
        let margin = self.mouse_length();
        let (width, height) = (self.width, self.height);
        for mouse in &mut self.mice {
            step(mouse, dt, width, height, speed, pace, margin, &mut self.rng);
        }
        self.mice.retain(|mouse| {
            mouse.state != State::Leave || !outside(mouse.x, mouse.y, width, height, margin * 1.2)
        });

        self.spawn_timer -= dt;
        if self.mice.len() < self.target_count() && self.spawn_timer <= 0.0 {
            self.spawn();
            self.spawn_timer = 0.9;
        }
    }

    /// A paw lands at (x, y). Returns true if it caught a mouse.
    pub fn tap(&mut self, x: f32, y: f32) -> bool {
        let reach = self.hit_radius();
        let nearest = self
            .mice
            .iter()
            .enumerate()
            .map(|(index, mouse)| (index, distance(mouse.x, mouse.y, x, y)))
            .filter(|&(_, d)| d <= reach)
            .min_by(|a, b| a.1.total_cmp(&b.1));

        let scare_radius = self.mouse_length() * 2.4;
        let caught = match nearest {
            Some((index, _)) => {
                let mouse = self.mice.remove(index);
                self.combo = if self.since_catch <= Self::COMBO_WINDOW { self.combo + 1 } else { 0 };
                self.since_catch = 0.0;
                let points = 10 * self.multiplier();
                self.score += points;
                self.catches += 1;
                self.effects.push(Effect { kind: EffectKind::Burst, x: mouse.x, y: mouse.y, age: 0.0, value: 0, angle: 0.0 });
                self.effects.push(Effect { kind: EffectKind::Points, x: mouse.x, y: mouse.y, age: 0.0, value: points, angle: 0.0 });
                true
            }
            None => {
                self.misses += 1;
                let angle = self.rng.range(-0.5, 0.5);
                self.effects.push(Effect { kind: EffectKind::Paw, x, y, age: 0.0, value: 0, angle });
                false
            }
        };

        // Anything close by bolts, whether the paw connected or not.
        for mouse in &mut self.mice {
            if mouse.state != State::Leave && distance(mouse.x, mouse.y, x, y) < scare_radius {
                mouse.heading = (mouse.y - y).atan2(mouse.x - x) + self.rng.range(-0.5, 0.5);
                mouse.state = State::Flee;
                mouse.timer = self.rng.range(0.45, 0.8);
            }
        }
        caught
    }

    fn spawn(&mut self) {
        let margin = self.mouse_length() * 0.7;
        let (x, y) = match (self.rng.unit() * 4.0) as u32 {
            0 => (-margin, self.rng.range(0.0, self.height)),
            1 => (self.width + margin, self.rng.range(0.0, self.height)),
            2 => (self.rng.range(0.0, self.width), -margin),
            _ => (self.rng.range(0.0, self.width), self.height + margin),
        };
        let (tx, ty) = interior_point(self.width, self.height, &mut self.rng);
        let kind = ((self.rng.unit() * self.kinds as f32) as usize).min(self.kinds - 1);
        self.spawned += 1;
        self.mice.push(Mouse {
            x,
            y,
            heading: (ty - y).atan2(tx - x),
            state: State::Dart,
            kind,
            phase: self.rng.range(0.0, 6.0),
            moving: true,
            timer: self.rng.range(0.8, 1.3),
            life: self.rng.range(10.0, 16.0),
        });
    }
}

#[allow(clippy::too_many_arguments)]
fn step(mouse: &mut Mouse, dt: f32, width: f32, height: f32, speed: f32, pace: f32, margin: f32, rng: &mut Rng) {
    mouse.timer -= dt;
    mouse.life -= dt;
    let velocity = match mouse.state {
        State::Dart => {
            mouse.phase += dt * 7.0;
            mouse.heading += mouse.phase.sin() * 0.9 * dt;
            keep_inside(mouse, width, height, margin * 0.5, 6.0 * dt);
            if mouse.timer <= 0.0 {
                if mouse.life <= 0.0 {
                    mouse.state = State::Leave;
                    mouse.heading = exit_heading(mouse.x, mouse.y, width, height) + rng.range(-0.4, 0.4);
                } else {
                    mouse.state = State::Rest;
                    mouse.timer = rng.range(0.35, 1.2) / pace;
                }
            }
            speed
        }
        State::Rest => {
            if mouse.timer <= 0.0 {
                let (tx, ty) = interior_point(width, height, rng);
                mouse.heading = (ty - mouse.y).atan2(tx - mouse.x) + rng.range(-0.35, 0.35);
                mouse.state = State::Dart;
                mouse.timer = rng.range(0.5, 1.3);
            }
            0.0
        }
        State::Flee => {
            mouse.phase += dt * 11.0;
            keep_inside(mouse, width, height, margin * 0.5, 9.0 * dt);
            if mouse.timer <= 0.0 {
                mouse.state = State::Dart;
                mouse.timer = rng.range(0.3, 0.8);
            }
            speed * 2.3
        }
        State::Leave => {
            mouse.phase += dt * 8.0;
            speed * 1.25
        }
    };
    mouse.moving = velocity > 0.0;
    mouse.x += mouse.heading.cos() * velocity * dt;
    mouse.y += mouse.heading.sin() * velocity * dt;
}

/// Turns back toward the middle when the mouse strays too close to an edge.
fn keep_inside(mouse: &mut Mouse, width: f32, height: f32, inset: f32, max_turn: f32) {
    let inside = mouse.x >= inset && mouse.x <= width - inset && mouse.y >= inset && mouse.y <= height - inset;
    if inside {
        return;
    }
    let home = (height / 2.0 - mouse.y).atan2(width / 2.0 - mouse.x);
    mouse.heading += angle_delta(mouse.heading, home).clamp(-max_turn, max_turn);
}

fn interior_point(width: f32, height: f32, rng: &mut Rng) -> (f32, f32) {
    (rng.range(width * 0.18, width * 0.82), rng.range(height * 0.18, height * 0.82))
}

/// Heading toward whichever edge is nearest.
fn exit_heading(x: f32, y: f32, width: f32, height: f32) -> f32 {
    let edges = [(x, PI), (width - x, 0.0), (y, -PI / 2.0), (height - y, PI / 2.0)];
    edges.iter().min_by(|a, b| a.0.total_cmp(&b.0)).map(|edge| edge.1).unwrap_or(0.0)
}

pub fn outside(x: f32, y: f32, width: f32, height: f32, margin: f32) -> bool {
    x < -margin || x > width + margin || y < -margin || y > height + margin
}

fn distance(ax: f32, ay: f32, bx: f32, by: f32) -> f32 {
    ((ax - bx).powi(2) + (ay - by).powi(2)).sqrt()
}

/// Smallest signed turn from `from` to `to`, in -π..π.
pub fn angle_delta(from: f32, to: f32) -> f32 {
    let mut delta = (to - from) % (2.0 * PI);
    if delta > PI {
        delta -= 2.0 * PI;
    }
    if delta < -PI {
        delta += 2.0 * PI;
    }
    delta
}

#[cfg(test)]
mod tests {
    use super::*;

    const W: f32 = 800.0;
    const H: f32 = 600.0;

    fn game() -> Game {
        Game::new(7, W, H, 3)
    }

    /// Runs the game for a number of seconds at 60 frames a second.
    fn run(game: &mut Game, seconds: f32) {
        for _ in 0..(seconds * 60.0) as usize {
            game.update(1.0 / 60.0);
        }
    }

    /// Advances until a mouse is fully on screen, then returns its position.
    fn wait_for_mouse(game: &mut Game) -> (f32, f32) {
        for _ in 0..600 {
            game.update(1.0 / 60.0);
            if let Some(mouse) = game.mice.iter().find(|m| !outside(m.x, m.y, W, H, -20.0)) {
                return (mouse.x, mouse.y);
            }
        }
        panic!("no mouse came on screen within ten seconds");
    }

    #[test]
    fn a_mouse_arrives_and_comes_on_screen() {
        let mut game = game();
        assert!(game.mice.is_empty());
        game.update(1.0 / 60.0);
        assert_eq!(game.mice.len(), 1);
        wait_for_mouse(&mut game);
    }

    #[test]
    fn tapping_a_mouse_catches_it_and_scores() {
        let mut game = game();
        let (x, y) = wait_for_mouse(&mut game);
        assert!(game.tap(x, y));
        assert_eq!(game.catches, 1);
        assert_eq!(game.score, 10);
        assert_eq!(game.misses, 0);
        assert!(game.mice.is_empty());
        assert!(game.effects.iter().any(|e| e.kind == EffectKind::Points && e.value == 10));
        assert!(game.effects.iter().any(|e| e.kind == EffectKind::Burst));
    }

    #[test]
    fn a_tap_just_inside_the_hit_radius_counts_and_just_outside_does_not() {
        let mut game = game();
        let (x, y) = wait_for_mouse(&mut game);
        let reach = game.hit_radius();
        assert!(!game.tap(x + reach + 2.0, y));
        assert_eq!(game.misses, 1);

        let mut game = self::game();
        let (x, y) = wait_for_mouse(&mut game);
        assert!(game.tap(x + reach - 2.0, y));
    }

    #[test]
    fn a_near_miss_scares_the_mouse_away_from_the_paw() {
        let mut game = game();
        let (x, y) = wait_for_mouse(&mut game);
        let paw_x = x + game.hit_radius() + 10.0;
        assert!(!game.tap(paw_x, y));
        let mouse = &game.mice[0];
        assert_eq!(mouse.state, State::Flee);
        // The paw was to the right, so the mouse heads left (within the random spread).
        assert!(mouse.heading.cos() < 0.0);
        assert!(game.effects.iter().any(|e| e.kind == EffectKind::Paw));
    }

    #[test]
    fn a_far_miss_leaves_the_mouse_alone() {
        let mut game = game();
        let (x, y) = wait_for_mouse(&mut game);
        let state = game.mice[0].state;
        let far_x = if x < W / 2.0 { W - 5.0 } else { 5.0 };
        let far_y = if y < H / 2.0 { H - 5.0 } else { 5.0 };
        assert!(!game.tap(far_x, far_y));
        assert_eq!(game.mice[0].state, state);
    }

    #[test]
    fn quick_catches_build_a_multiplier_and_slow_ones_reset_it() {
        let mut game = game();
        let mut earned = Vec::new();
        for _ in 0..7 {
            let (x, y) = wait_for_mouse(&mut game);
            let before = game.score;
            // Tap everything in reach so several mice don't spoil the count.
            assert!(game.tap(x, y));
            earned.push(game.score - before);
            // Bring the next catch inside the combo window.
            game.since_catch = 0.5;
        }
        assert_eq!(earned, vec![10, 10, 10, 20, 20, 20, 30]);

        let (x, y) = wait_for_mouse(&mut game);
        game.since_catch = Game::COMBO_WINDOW + 1.0;
        let before = game.score;
        assert!(game.tap(x, y));
        assert_eq!(game.score - before, 10);
    }

    #[test]
    fn more_catches_bring_more_and_faster_mice_up_to_a_limit() {
        let mut game = game();
        assert_eq!(game.target_count(), 1);
        let slow = game.pace();
        game.catches = 4;
        assert_eq!(game.target_count(), 2);
        assert!(game.pace() > slow);
        game.catches = 10_000;
        assert_eq!(game.target_count(), Game::MAX_MICE);
        assert_eq!(game.pace(), 1.6);
        assert_eq!(game.multiplier(), 1);
    }

    #[test]
    fn mice_never_wander_far_off_screen_and_the_count_stays_bounded() {
        let mut game = game();
        game.catches = 12;
        let margin = game.mouse_length() * 1.5;
        for frame in 0..(60 * 120) {
            game.update(1.0 / 60.0);
            assert!(game.mice.len() <= Game::MAX_MICE);
            for mouse in &game.mice {
                assert!(!outside(mouse.x, mouse.y, W, H, margin), "mouse escaped at frame {frame}");
                assert!(mouse.x.is_finite() && mouse.y.is_finite() && mouse.heading.is_finite());
            }
        }
    }

    #[test]
    fn a_mouse_that_is_ignored_eventually_leaves_and_another_arrives() {
        let mut game = game();
        game.update(1.0 / 60.0);
        assert_eq!(game.spawned, 1);
        run(&mut game, 40.0);
        assert!(game.spawned >= 2, "the first mouse never left");
        // Still exactly one at a time: nothing has been caught.
        assert_eq!(game.mice.len(), 1);
    }

    #[test]
    fn the_same_seed_plays_the_same_game() {
        let (mut a, mut b, mut c) = (Game::new(42, W, H, 3), Game::new(42, W, H, 3), Game::new(43, W, H, 3));
        run(&mut a, 6.0);
        run(&mut b, 6.0);
        run(&mut c, 6.0);
        assert_eq!((a.mice[0].x, a.mice[0].y), (b.mice[0].x, b.mice[0].y));
        assert_ne!((a.mice[0].x, a.mice[0].y), (c.mice[0].x, c.mice[0].y));
    }

    #[test]
    fn resizing_keeps_everything_in_proportion() {
        let mut game = game();
        let (x, y) = wait_for_mouse(&mut game);
        game.resize(W / 2.0, H * 2.0);
        assert!((game.mice[0].x - x / 2.0).abs() < 0.01);
        assert!((game.mice[0].y - y * 2.0).abs() < 0.01);
        assert_eq!((game.width, game.height), (W / 2.0, H * 2.0));
        game.resize(0.0, -5.0);
        assert_eq!((game.width, game.height), (1.0, 1.0));
    }

    #[test]
    fn effects_fade_and_are_removed() {
        let mut game = game();
        game.tap(10.0, 10.0);
        assert_eq!(game.effects.len(), 1);
        run(&mut game, Effect::LIFE / 2.0);
        assert!(game.effects[0].progress() > 0.3 && game.effects[0].progress() < 0.7);
        run(&mut game, Effect::LIFE);
        assert!(game.effects.iter().all(|e| e.kind != EffectKind::Paw));
    }

    #[test]
    fn a_huge_frame_gap_is_clamped() {
        let mut game = game();
        game.update(1.0 / 60.0);
        let before = (game.mice[0].x, game.mice[0].y);
        game.update(30.0);
        let moved = distance(before.0, before.1, game.mice[0].x, game.mice[0].y);
        assert!(moved < 100.0, "a stalled tab should not teleport the mouse ({moved}px)");
    }

    #[test]
    fn angle_delta_takes_the_short_way_round() {
        assert!((angle_delta(0.1, 2.0 * PI - 0.1) + 0.2).abs() < 1e-4);
        assert!((angle_delta(0.0, 1.0) - 1.0).abs() < 1e-6);
        assert_eq!(angle_delta(2.0, 2.0), 0.0);
    }

    #[test]
    fn the_generator_stays_in_range() {
        let mut rng = Rng::new(1);
        for _ in 0..10_000 {
            let value = rng.unit();
            assert!((0.0..1.0).contains(&value));
            let ranged = rng.range(3.0, 4.0);
            assert!((3.0..=4.0).contains(&ranged));
        }
    }
}
