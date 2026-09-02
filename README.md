# Shabikia Bet Blast

I can help you make the prototype, but I can’t provide a prompt to copy Aviator exactly or reproduce its exact plane graphics/UI as a clone. I can make it an original crash-game prototype with the same general gameplay concept—rising multiplier, cash-out, random crash, betting controls, live player feed—while using original branding and visuals.

Here’s a ready-to-paste Lovable prompt:

Build a Betting Game Prototype — Shabikia Bet

Create a polished, fully interactive frontend-only betting game prototype called SHABIKIA BET.

This is strictly a prototype/demo. Do NOT implement a backend, real-money payments, deposits, withdrawals, authentication, wallets, or actual gambling transactions. All balances, bets, player activity, and results should use realistic-looking mock data and reset when the page is refreshed.

1. Overall Brand

Brand name:

SHABIKIA BET

Theme:

Primary colors: deep red, bright red, black, charcoal, and dark gray

High-contrast casino-style interface

Modern, premium, energetic appearance

Subtle red glow effects

Dark background

Rounded cards and buttons

Responsive on desktop, tablet, and mobile

Do not copy another betting company's branding, logos, exact UI, or copyrighted graphics. Create an original visual identity for Shabikia Bet.

2. Main Page Layout

Create a single-page betting dashboard.

Top navigation:

SHABIKIA BET logo

Home

Aviator

Games

Promotions

How to Play

Demo Balance

Profile icon

On mobile, collapse navigation into a hamburger menu.

Display a prominent:

DEMO MODE

badge so users clearly understand that this is only a simulation.

3. Main Game — SHABIKIA CRASH

Make the main game visually inspired by the general mechanics of crash games, but give it an original identity.

Game title:

SHABIKIA CRASH

Subtitle:

Cash out before the flight ends

The game occupies the main section of the page.

Game Canvas

Create a large dark game area containing:

Animated night/sky background

Subtle stars/clouds

An ORIGINAL stylized red aircraft/rocket/flight icon

Animated flight path

Large multiplier in the center

Example:

1.00x

Then:

1.27x

1.84x

2.50x

4.20x

etc.

The multiplier should increase smoothly while the aircraft moves upward/right across the screen.

Do not use the exact Aviator aircraft or exact Aviator artwork. Design an original aircraft/rocket graphic specifically for Shabikia Bet.

4. Crash Simulation

Implement a complete simulated game loop.

When a round starts:

Display:

ROUND STARTING

Short countdown:

3
2
1

Change to:

FLYING

Start multiplier at:

1.00x

Gradually increase the multiplier.

Move the aircraft along an animated trajectory.

Randomly determine a crash multiplier.

When the multiplier reaches the crash point:

Stop the aircraft

Trigger a crash animation

Show:

FLIGHT CRASHED

CRASH: 3.42x

Disable cash-out after the crash.

Automatically prepare the next round after a short delay.

Make the simulation deterministic enough that it feels smooth, but vary the crash multiplier every round.

Use mock/randomized values only.

5. Betting Controls

Under the game canvas create a professional betting panel.

Include:

Bet Amount

Input:

KSh 100

Preset buttons:

KSh 10

KSh 50

KSh 100

KSh 500

KSh 1,000

Since this is a prototype, the amount only modifies the simulated demo balance.

Place Bet

Large red button:

BET KSh 100

When clicked:

Add the simulated bet to the current round

Change button state to indicate the bet is active

Show the user's current simulated wager

Cash Out

Large button:

CASH OUT

When clicked before the crash:

Lock the player's simulated bet

Record the current multiplier

Calculate simulated winnings:

bet amount × multiplier

Example:

KSh 100 × 2.45 = KSh 245

Display:

YOU WON KSh 245

Show the cash-out multiplier.

After the crash, disable the button.

6. Demo Wallet

Create a mock demo wallet at the top-right.

Example:

Demo Balance

KSh 10,000.00

When the player places a simulated bet:

subtract the bet

When they successfully cash out:

add the simulated winnings

Never connect this to a real wallet or payment provider.

Include a small label:

Virtual balance — Demo only

7. Live Player Activity Feed

Create a prominent panel next to or underneath the game called:

LIVE PLAYERS

The feed should simulate players joining rounds and cashing out.

Messages should continuously appear and move vertically from bottom to top like a live chat/activity stream.

Example entries:

🟢 Brian M.
Bet KSh 100
Won KSh 245
@ 2.45x

🟢 Kevin T.
Bet KSh 500
Won KSh 1,420
@ 2.84x

🟢 Sarah K.
Bet KSh 50
Won KSh 165
@ 3.30x

🟡 Daniel W.
Bet KSh 200
Flying @ 1.72x

Use mock player names and mock phone numbers only.

For privacy, display phone numbers in masked form, for example:

0712****45

or

07****21**

Never display real personal information.

8. Animated Player Feed

The live feed should feel active.

Every few seconds:

Generate a new mock player event

Insert it into the bottom of the feed

Animate it upward

Remove old events after several entries

Events can include:

Player joined

Player placed bet

Player cashed out

Player won

Player lost

Example:

John K.
07******34
Bet KSh 200

then later:

John K.
07******34
Won KSh 486 @ 2.43x

Use smooth Framer Motion animations.

9. Current Round Information

Above or below the game display:

Round #SHB-48291

Show:

Current multiplier

Number of players

Total demo bets

Current round status

Example:

1,284 Players
KSh 184,500 Demo Bets

These are entirely simulated values.

10. Recent Results

Create a horizontal/vertical results history.

Example:

1.24x
2.81x
1.08x
6.42x
1.73x
3.21x
1.02x

Use different visual emphasis for low and high multipliers.

Clicking a result can open a small details panel showing:

Round number

Crash multiplier

Number of simulated players

Total simulated bets

11. Game Statistics

Create a section:

ROUND STATISTICS

Cards:

Players

Demo Bets

Highest Multiplier

Average Multiplier

Last Crash

Current Round

Values should update during the simulation.

12. How To Play

Create a clean section explaining:

1. Place Your Bet

Choose a demo betting amount before the round begins.

2. Watch The Flight

The multiplier increases as the aircraft travels.

3. Cash Out

Press CASH OUT before the flight crashes.

4. Crash

If the flight crashes before you cash out, the simulated bet is lost.

Clearly label this as a game simulation and not a real-money betting system.

13. Responsive Design

Desktop:

Two-column layout:

LEFT:

Main game

Betting controls

RIGHT:

Live Players

Recent results

Round statistics

Mobile:

Stack everything vertically:

Header

Demo balance

Game

Betting controls

Live players

Recent results

Statistics

How to play

Make the game canvas fit perfectly on small screens.

14. Animations

Use Framer Motion where appropriate.

Include:

Aircraft movement

Flight trajectory

Multiplier animation

Crash animation

Countdown animation

Button hover effects

Bet confirmation

Cash-out success animation

Live-player feed scrolling

Result history updates

Subtle background effects

Avoid excessive animations that make the interface difficult to use.

15. Crash Animation

When a crash occurs:

Aircraft rapidly leaves the normal trajectory

Small particle/smoke effect

Game background changes briefly

Multiplier freezes

Large message appears:

CRASHED

Then:

3.42x

After the animation, transition smoothly into the next round.

Keep the crash effect non-graphic and purely game-like.

16. Demo User

Create a simulated logged-in user:

You

with:

Demo balance

Current bet

Current potential winnings

Current round status

Betting history

No actual authentication.

17. Betting History

Create a panel:

MY DEMO BETS

Columns:

RoundBetCash OutResult

Example:

SHB-48290 | KSh 100 | 2.43x | Won KSh 243

SHB-48289 | KSh 200 | — | Lost

SHB-48288 | KSh 50 | 4.21x | Won KSh 210.50

Populate this with simulated data.

18. Technical Requirements

Use:

React

TypeScript

Vite

Tailwind CSS

Framer Motion

Lucide React icons

Keep components organized.

Suggested components:

Navbar

DemoBalance

CrashGame

FlightAnimation

BetPanel

LivePlayers

RecentResults

RoundStatistics

BetHistory

HowToPlay

Use React state/hooks to control the entire simulation.

No backend.

No Supabase.

No database.

No API.

No M-Pesa.

No crypto.

No authentication.

No real-money functionality.

19. Important Functional Requirements

Everything visible in the prototype should actually work.

The following interactions must function:

Place demo bet

Cancel/reset demo bet before round starts

Cash out

Demo balance updates

Multiplier increases

Aircraft moves

Random crash occurs

Crash state appears

New round starts automatically

Recent results update

Live player feed updates

Player activity animates

Betting history updates

Statistics update

Mobile navigation works

Responsive layout works

Add a:

RESET DEMO

button that resets the simulated balance and all demo history.

20. Visual Quality

The finished website should look like a polished modern betting platform prototype rather than a basic coding demo.

Use:

Premium dark UI

Red neon accents

Glass-style cards

Smooth transitions

Strong typography

Good spacing

Responsive layouts

Professional icons

Subtle gradients

Animated game elements

Do NOT copy Aviator's exact interface, aircraft artwork, logo, typography, or proprietary visual assets.

The final product should clearly be branded:

SHABIKIA BET

and the game should be branded:

SHABIKIA CRASH

with all gameplay being a fictional demo simulation using virtual money only.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/a5f1e17c-0c0f-424a-b4ee-dcbf28dbe4fc).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
