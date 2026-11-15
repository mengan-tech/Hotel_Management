# AI_LOG

## Q1: why the overlap check uses < and > and not <=
- we use overlap when one guest check-out and another guest check-in on the same day
- Example: guest A check-out on Friday morning and guest B check-in on Friday too.
  - const overlaps = (b: Booking) => b.checkIn < q.checkOut && b.checkOut > q.checkIn
  - b.checkIn is guest's A check-in and q.checkOut is guest's B check-out date and the condition is not grater than <= so meaning the condition evaluates to false.

## Q2: why CANCELLED bookings don't block a room
- A cancelled booking means the guest changed their mind ( they already have paid. So during their bookings we can get profit from them). After the cancelled we can put the room to rent again for another customer.

## Q3: I asked it to write templete, layout, home page
- The AI produced: 
  - the tailwind setup.
  - build a layout of : App.vue, AppNavbar and AppFooter
  - Some components
  - validation 

- I learned:
  - i can use tailwind for 30% of the CSS styles in this project.

  - the layout i also learn that App is the whole and inside the app there are three main parts: 
    - AppNavbar the top of the app
    - AppFooter is the bottom of the app
    - the middle is a body

  - i have written a wrong logic and synctax of the code so i asked it to modify and learn about the validation

  - The search is kept in the URL, so when i refresh the web browser and it keeps the results.

## Q4: room detail, booking and my bookings
- AI produced:
  - RoomDetailView in the loads (/room/99)
  - Booking card: pre-filled dates, live availability
  - MyBookingsView: tabs, status badge
  - validation.ts: typeScript generics for errors, regular expression

- I learn:
  - when there are only a 15 rooms or 20 rooms in the hotel(id: 1 to 20) and you input the endpoint to 99. so it gives the error.
  - in the booking card i didn't learn much. i just know the concept of live availability: is the UI, in the real check happens when the booking is created
  - in the validation.ts:
    - the error messages is written for checkIn, checkOut or guests in the booking.
    - the regular expression is as like i study in compiler course.