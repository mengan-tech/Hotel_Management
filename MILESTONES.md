# Milestones

## M0 - Proposal
**which story did you cut from the MVP, and why?
Explain: we decided to move the manager dashboard to the nice-to-have features:
- we focus on room availability, online and walk-in bookings, preventing double booking and fronend-desk operation
- The dashboard can be developed later

## M1 - Frontend Prototype
**What state lives in the store and what stays inside a component? Why?
- The state consists of: 
    - Global access: All the pages or the whole app must know who is login. So authentication state isn't just for one page but the whole. Pinia do as a single source that can be accessed by any component anywhere in the app.
    - Persistence: the store handles saving and loading the user from the localStorage. if a user refreshes the page, i don't want the use suddently logout.

- The state that need to stay inside a Components:
    - Form inputs: variables tracking what the user is typing right now.
    - Dropdown toggles: a dropdown menu or a login modal is currently open.
- It stays in the component because:
    - different from the rest of the app: the app hotel doesn't care what text is currently typed into the password box on the login screen?
    - Encapsulation: if you put form input values into a global, this may overwrite each other's typing. Local state dies or resets when the user leaves the component.