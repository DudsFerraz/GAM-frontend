# Minimal authenticated home panel

## Status

Accepted design for implementation. This specification records planned behavior; it does not describe the current `/home` implementation.

## Context

The authenticated home page currently repeats navigation already provided by the application shell and loads operational summaries that are not necessary for the page's primary job. Quick-access links, event and solicitation metrics, and the upcoming-events list add visual and data-fetching cost without providing unique value.

The accepted direction is deliberately minimal: `/home` is an identity and welcome surface. Feature discovery and access remain the responsibility of the authenticated side navigation.

## Goals

- Reduce `/home` to one purposeful GAM panel.
- Keep the authenticated person's greeting and main access type visible.
- Preserve the mission-oriented image card as the panel's single expressive element on larger screens.
- Reuse the four images and quotations already presented on the login page.
- Remove duplicated navigation and operational information.
- Avoid mounting or running decorative carousel behavior on mobile.

## Non-goals

- Adding new shortcuts, calls to action, metrics, notifications, event summaries, or solicitation summaries.
- Changing the authenticated side navigation.
- Changing access or permission semantics.
- Redesigning the login page.
- Adding backend operations or changing API contracts.
- Expanding the home page as other product features are implemented.

## Page composition

The authenticated `/home` route renders only one section: the **Painel do GAM**.

The panel contains:

1. The label `Painel do GAM`.
2. A personalized greeting using the first name already obtained from the current Account.
3. A compact access indicator with the translated main access type from the current Account.
4. On screens at least 768 px wide, a smaller overlaid mission carousel in the lower-right area.

The panel does not contain supporting introduction copy, action buttons, operational counts, lists, or secondary sections.

## Visual direction

The accepted composition is option C, the overlaid-card direction:

- The existing dark-blue GAM hero treatment remains the visual foundation.
- The panel fills the complete usable content height inside the authenticated shell while preserving the shell's existing outer margins.
- No unused page-background area remains below the panel at desktop heights.
- Identity content occupies the left portion of the panel.
- The mission carousel appears as a distinct image card overlapping the lower-right area and acts as the panel's dominant secondary element.
- Overlap is used only for the mission card; no additional floating decoration or card is added.
- The mission card retains the current home card's image-first treatment and does not copy the full-height login layout.
- On ordinary desktop widths, the mission card occupies approximately 44–48% of the panel width and about 60% of its height.
- Spacing and contrast must keep the greeting, access indicator, and quotation readable in light and dark themes.

## Mission carousel

The carousel uses the exact four image-and-quotation pairs currently shown in the login experience:

1. `gam.jpg` — “Leva-me aonde os homens necessitem a Tua palavra”
2. `criancas_oratorio.jpeg` — “Basta que sejam jovens para que eu os ame”
3. `db_jovens.jpg` — “Deus nos colocou no mundo para os outros”
4. `db_jovens_maria.jpg` — “Não é com pancadas, mas com a mansidão e a caridade que deverás ganhar esses teus amigos.”

Login and authenticated home consume one shared slide definition so their content cannot drift. Their layouts remain separate.

The home carousel:

- advances automatically every five seconds;
- transitions image and quotation together;
- shows only the image, the `Nosso propósito` label, and the current quotation;
- omits the existing explanatory paragraph;
- does not add navigation links or calls to action;
- does not offer pause, playback, or manual-navigation controls;
- remains static and does not auto-advance when reduced motion is preferred.

The transition must avoid layout shifts. Alternative text must not redundantly announce decorative imagery when the visible quotation already conveys the slide's content.

## Responsive behavior

At widths of 768 px and above:

- the GAM panel fills the usable shell height without creating page scrolling solely because of its own size;
- the mission carousel is present;
- the card is overlaid in the panel's lower-right area;
- identity content keeps sufficient width and must not collide with the card;
- the card uses proportional width and height rather than a small fixed-height treatment;
- the panel may reduce the overlay proportion on intermediate widths while preserving the same hierarchy.

Below 768 px:

- the entire mission carousel is absent, including image, quotation, and label;
- the carousel timer and transition behavior do not run;
- no space is reserved for the removed card;
- the panel still fills the usable shell height and contains only its label, greeting, and main access type.

The breakpoint behavior must respond when the viewport crosses 768 px without requiring a page reload.

## Data and state

The page keeps only the current-Account dependency already used for authenticated identity:

- `displayName` supplies the greeting.
- `roles` supplies the translated main access label through the existing account presentation boundary.

The page must remove event and solicitation queries, filters, sorting, counts, retry actions, and permission calculations that existed only for removed home content. Operational feature data remains owned and loaded by its dedicated feature pages.

Carousel state is local presentation state. It does not use TanStack Query or persistence.

## Loading and unavailable Account states

The existing deliberate asynchronous boundary remains:

- while the current Account loads, show the standard Portuguese loading state;
- when no current Account is available, show the standard Portuguese unavailable state;
- do not render partial panel content with an invented name or access type.

No event- or solicitation-specific loading, empty, error, or retry state remains on `/home`.

## Component boundaries

- The route file remains thin and continues to compose the authenticated home feature.
- `AuthenticatedHomePage` coordinates the current-Account boundary and the single panel.
- The dashboard panel owns its visual composition.
- The mission carousel is a focused component with its timer, reduced-motion behavior, and responsive lifecycle isolated from Account data.
- The four shared slide definitions live outside both the authentication and home feature folders so neither feature imports from the other.
- Home components that become unused after the redesign are removed only when repository search confirms they have no remaining consumer.

No generic carousel framework or new UI library is introduced.

## Accessibility

- The panel uses a semantic heading structure headed by the personalized page heading.
- The access type is readable text and does not rely on iconography alone.
- Automatic advancement is disabled for `prefers-reduced-motion: reduce`.
- Contrast remains sufficient over every supplied image.
- Hidden mobile carousel content is not present in the accessibility tree.

## Verification

Focused tests should prove observable behavior:

- the page renders greeting and translated main access type from the current Account;
- removed shortcuts, buttons, metrics, event list, and explanatory copy are absent;
- event and solicitation hooks are no longer invoked by `/home`;
- the carousel cycles through the shared slides at the accepted interval on eligible widths;
- reduced-motion behavior stops automatic advancement;
- below 768 px the carousel is absent and no interval is active;
- crossing the breakpoint mounts or removes the carousel correctly;
- loading and unavailable Account states remain explicit.

Run the normal repository checks after implementation:

- `npm run lint`
- `npm run build`
- focused Vitest tests for the authenticated home and carousel behavior

## Acceptance criteria

The redesign is complete when:

1. `/home` contains only the Painel do GAM.
2. No quick access, event summary, solicitation summary, action button, or upcoming-event list remains.
3. The panel shows the authenticated person's greeting and translated main access type.
4. The overlaid mission card uses the four accepted login images and quotations on widths of at least 768 px.
5. The panel fills the usable shell height with the shell margins preserved and no page-background void below it.
6. The mission card is proportionally larger, occupying roughly half the desktop panel width and about 60% of its height.
7. The mission card and all of its behavior are absent below 768 px without reserving space.
8. The page no longer requests event or solicitation data.
9. Motion, contrast, and Account loading/error boundaries meet the behavior defined above.
10. Relevant tests, lint, and build pass without regressions.
