# Hotel Management System

## Problem
Small hotels take bookings by phone, chat or a notebook. So this problem can happend when the same room is sometimes given to two guests for the same night and the front desk does not know which rooms are clean and ready. Money are calculated by hands. The manager doesn't have the simple view of the monthly revenue.

## Users and roles
- Guest: registers, searches free rooms by date, book a room type, sees and cancels own bookings. after booking, sees own invoices.
- Receptionist: creates walk-in bookings, checks guests in and out, updates room status and prints the invoice at check-out
- Manager: manages room types, rooms, prices and photo, or read the revenue reports.

## User stories:
1. As a guest, i want to register and log in so that I can book rooms and see my bookings.
2. As a guest, i want to search for avaliable room types by check-in date, check-out date and number of guests.
Accepted:
    - check-out is after check-in
    - the stay is at most 21 nights and can book at most 300 days ahead.
    - only room types with at least one room free for every night and not in maintenance are shown
    - the search answers in under 1.5 second with more than 50 rooms and 1500 bookings.

3. As a guest, i want to book a room type for my dates so that my stay is reserved and no one else get this room. (double booking must not happened)

4. As a guest, i want to see my bookings with status and cancel one before the check-in date so that i can change my plans. (if already book the money can't give to the customer back)

5. As a receptionist, check guests in and out so that room status and bill are always correct.
Accepted:
    - CONFIRMED  -> CHECKED_IN
    - CHECKED_IN -> CHECKED_OUT
Rejected:
    - ohterwise: guests who tries gets 403.

6. As a receptionist, i want to see today's arrivals, departures and the status of every room so that i know which rooms are ready.

7. As a manager, i want to create, edit and deactivate room types (photos, capacity, price) and rooms so that guests always see correct information. this is helpful when the events is comming.

8. As a manager, i want to get a revenue per month and a calendar of bookings per room.

## MVP scope
Must have: 1,2,3,4,5,6
Nice to have: 7,8

## Entities
| Entity | Main attributes | Relations |
|---|---|---|
| User | name, email, phone, passwordHash, role (GUEST, RECEPTIONIST, MANAGER) | has many Bookings |
| RoomType | name, description, bed, sizeM2, capacity, priceUsd, priceKhr, photos, active | has many Rooms, has many Bookings |
| Room | number, floor, status (AVAILABLE, OCCUPIED, CLEANING, MAINTENANCE) | belongs to RoomType, has many Bookings |
| Booking | checkIn, checkOut, guests, status, specialRequest, totalUsd, guestName and guestPhone (walk-ins) | belongs to User, RoomType and Room; has one Invoice; has many ExtraCharges |
| Invoice | number, roomTotal, extrasTotal, total, paymentMethod, paidAt | belongs to Booking |

## Repository
https://github.com/mengan-tech/Hotel_Management