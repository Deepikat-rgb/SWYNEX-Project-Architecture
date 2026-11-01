
# SWYNEX Project Architecture: Queueless Campus Canteen

**Task 1 – SWYNEX Technologies Internship**

A full-stack web application designed to eliminate long queues in college canteens. Students can browse food items, place orders online, select pickup time slots, and collect food using a token number. Kitchen staff can manage orders, food availability, pickup slots, and sales reports through a separate dashboard.

---

## 1. Product Idea

**Problem:**

During peak college hours, students spend 15–30 minutes waiting in canteen queues. Manual ordering also makes it difficult for kitchen staff to manage incoming orders and predict food demand.

**Solution:**

A digital canteen management system where students can order food in advance, select a pickup time slot, make payments, and collect their orders using a token number.

Kitchen staff can manage orders through a dedicated dashboard, update order statuses, control pickup slots, and monitor sales.

**Target Users:**

| Role | Responsibilities |
|---|---|
| Student | Browse menu, add food to cart, place orders, select pickup slots, and track orders |
| Kitchen Staff | Manage incoming orders, update order status, and control food availability |
| Canteen Manager | Monitor daily, weekly, and monthly sales and view order history |

**Core Features (MVP):**

- Student and Kitchen separate dashboards
- Food menu with different categories
- Add to cart and quantity management
- Pickup time slot booking (15-minute intervals)
- Online payment or pay-at-counter option
- Automatic order token generation
- Order tracking and order history
- Kitchen order management
- New, Preparing, Ready, and Collected order statuses
- Food availability and sold-out management
- Today, weekly, and monthly sales reports
- Order history with CSV export

**Out of Scope (Future Enhancements):**

QR code collection, real-time notifications, multiple canteen support, loyalty points, and advanced analytics.

---

## 2. Tech Stack

| Layer | Technology |
|---|---|
| Frontend | HTML5, CSS3, JavaScript |
| Planned Frontend | React + Vite |
| Backend | Node.js + Express.js |
| Database | PostgreSQL |
| Authentication | JWT + bcrypt |
| Payments | Razorpay / UPI Gateway |
| Live Updates | Server-Sent Events |
| Version Control | Git and GitHub |
| Hosting (Suggested) | Vercel, Render, Managed PostgreSQL |

---

## 3. System Architecture

```text
       [ Student Browser ]
                |
                |
       [ Kitchen Browser ]
                |
                v
         [ Frontend Layer ]
                |
                | HTTPS Requests (JSON)
                v
        [ Express REST API ]
                |
       +--------+---------+
       |        |         |
       v        v         v
   [ Auth ]  [ Orders ] [ Menu ]
       |        |         |
       +--------+---------+
                |
                v
          [ PostgreSQL ]
                |
       +--------+---------+
       |                  |
       v                  v
 [ Payment Gateway ] [ Sales Reports ]
      (Planned)         & Analytics
```

**Flow:**

Students interact with the student dashboard to browse food items and place orders. The frontend communicates with the Express REST API through HTTP requests.

The backend handles authentication, menu management, pickup slots, orders, and sales information. PostgreSQL stores the application data.

Kitchen staff use a separate dashboard to manage incoming orders and update their preparation status.

Server-Sent Events are planned for live order updates.

**Key Design Decisions:**

- Store monetary values in whole paise to avoid rounding errors.
- Use database transactions and slot locking to prevent pickup slot overbooking.
- Store food name and price snapshots in order items to preserve historical order details.
- Use role-based access for students and kitchen staff.

---

## 4. Data Models

### Users

| Field | Type | Description |
|---|---|---|
| id | Serial | Primary key |
| name | Text | User name |
| roll_no | Text | Unique student roll number |
| email | Text | Unique email |
| password_hash | Text | Hashed password |
| role | Enum | Student or Kitchen |
| created_at | Timestamp | Account creation time |

### Categories

| Field | Type | Description |
|---|---|---|
| id | Serial | Primary key |
| name | Text | Food category |
| sort_order | Integer | Display order |

### Menu Items

| Field | Type | Description |
|---|---|---|
| id | Serial | Primary key |
| category_id | Reference | Category reference |
| name | Text | Food item name |
| price_paise | Integer | Food price in paise |
| is_available | Boolean | Availability status |

### Slots

| Field | Type | Description |
|---|---|---|
| id | Serial | Primary key |
| slot_date | Date | Pickup date |
| start_time | Time | Pickup time |
| capacity | Integer | Maximum orders |
| is_closed | Boolean | Slot availability |

### Orders

| Field | Type | Description |
|---|---|---|
| id | Serial | Primary key |
| token_no | Integer | Order token |
| user_id | Reference | Student reference |
| slot_id | Reference | Pickup slot |
| status | Enum | Order status |
| total_paise | Integer | Total amount |
| payment_method | Enum | Online or Counter |
| payment_status | Enum | Pending, Paid, Failed, Due |
| created_at | Timestamp | Order creation time |

### Order Items

| Field | Type | Description |
|---|---|---|
| id | Serial | Primary key |
| order_id | Reference | Order reference |
| menu_item_id | Reference | Food item reference |
| name_snapshot | Text | Food name at order time |
| unit_price_paise | Integer | Item price |
| quantity | Integer | Item quantity |

### Payments

| Field | Type | Description |
|---|---|---|
| id | Serial | Primary key |
| order_id | Reference | Order reference |
| provider | Text | Payment provider |
| provider_ref | Text | Gateway payment ID |
| amount_paise | Integer | Payment amount |
| status | Text | Payment status |

### Order Status Events

| Field | Type | Description |
|---|---|---|
| id | Serial | Primary key |
| order_id | Reference | Order reference |
| status | Enum | Updated order status |
| changed_by | Reference | Staff reference |
| changed_at | Timestamp | Status update time |

**Relationships:**

- One user can have multiple orders.
- One pickup slot can contain multiple orders.
- One order can have multiple order items.
- One category can contain multiple food items.
- One order can have multiple status events.

---

## 5. API Routes

Base URL: `/api`

### Authentication

| Method | Route | Description | Access |
|---|---|---|---|
| POST | `/api/auth/register` | Register student | Public |
| POST | `/api/auth/login` | User login | Public |
| POST | `/api/auth/logout` | Logout | Logged In |
| GET | `/api/auth/me` | Get current user | Logged In |

### Menu

| Method | Route | Description | Access |
|---|---|---|---|
| GET | `/api/menu` | View food menu | Public |
| POST | `/api/menu` | Add food item | Kitchen |
| PATCH | `/api/menu/:id` | Update food item | Kitchen |
| PATCH | `/api/menu/:id/availability` | Update availability | Kitchen |
| DELETE | `/api/menu/:id` | Delete food item | Kitchen |

### Pickup Slots

| Method | Route | Description | Access |
|---|---|---|---|
| GET | `/api/slots` | View available slots | Student, Kitchen |
| PATCH | `/api/slots/:id` | Update slot | Kitchen |
| PUT | `/api/slots/capacity` | Update slot capacity | Kitchen |

### Orders

| Method | Route | Description | Access |
|---|---|---|---|
| POST | `/api/orders` | Place order | Student |
| GET | `/api/orders/mine` | View my orders | Student |
| GET | `/api/orders/:id` | View order details | Student, Kitchen |
| GET | `/api/orders` | View orders and history | Kitchen |
| PATCH | `/api/orders/:id/status` | Update order status | Kitchen |
| POST | `/api/orders/:id/cancel` | Cancel order | Student, Kitchen |
| GET | `/api/orders/stream` | Live order updates | Logged In |
| GET | `/api/orders/export.csv` | Export order history | Kitchen |

### Payments

| Method | Route | Description | Access |
|---|---|---|---|
| POST | `/api/payments/create` | Create payment | Student |
| POST | `/api/payments/webhook` | Verify payment | Gateway |

### Sales

| Method | Route | Description | Access |
|---|---|---|---|
| GET | `/api/sales/summary` | Sales summary | Kitchen |
| GET | `/api/sales/top-items` | Best-selling dishes | Kitchen |

### Sample Request: Place an Order

```json
{
  "items": [
    {
      "menu_item_id": 1,
      "quantity": 2
    }
  ],
  "slot_id": 42,
  "payment_method": "online"
}
```

### Sample Response

```json
{
  "id": 981,
  "token_no": 105,
  "status": "placed",
  "payment_status": "pending",
  "total_paise": 10000
}
```

### Order Status Flow

```text
Placed
   |
   v
Preparing
   |
   v
Ready
   |
   v
Collected
```

Orders may also be cancelled before reaching the ready stage, subject to the application's cancellation rules.

---

## 6. Frontend Screens

### Student Dashboard

1. **Student Portal:** Entry point for students.
2. **Food Menu:** Browse food categories and available dishes.
3. **Cart:** View selected items and manage quantities.
4. **Checkout:** Select pickup time slot and payment method.
5. **Order Confirmation:** Display order token number.
6. **My Orders:** Track order progress and payment status.
7. **Order History:** View previous orders.

### Kitchen Dashboard

1. **Kitchen Login:** Staff authentication.
2. **Live Orders:** Manage New, Preparing, and Ready orders.
3. **Food Management:** Add, edit, and update food availability.
4. **Slot Management:** Close, reopen, and manage pickup slots.
5. **Sales Dashboard:** Today, weekly, and monthly sales.
6. **Order History:** Search and filter previous orders.
7. **CSV Export:** Download order records.

### Screen Flow

```text
              Portal Selection
                     |
           +---------+---------+
           |                   |
           v                   v
     Student Portal       Kitchen Portal
           |                   |
           v                   v
       Food Menu           Live Orders
           |                   |
           v                   v
          Cart            Order Management
           |                   |
           v                   v
        Checkout          Sales Dashboard
           |                   |
           v                   v
     Order Tracking        Order History
```

The frontend prototype uses browser localStorage for demonstration instead of connecting to the backend API.

---

## 7. Folder Structure

```text
SWYNEX-Project-Architecture/
│
├── README.md
├── .gitignore
│
├── docs/
│   ├── ARCHITECTURE.md
│   └── screenshots/
│
├── frontend/
│   ├── index.html
│   ├── style.css
│   └── script.js
│
└── backend/
    ├── package.json
    ├── .env.example
    │
    ├── db/
    │   └── schema.sql
    │
    └── src/
        ├── server.js
        ├── routes/
        │   ├── auth.js
        │   ├── menu.js
        │   ├── slots.js
        │   ├── orders.js
        │   ├── payments.js
        │   └── sales.js
        │
        ├── middleware/
        │   └── auth.js
        │
        └── data/
            └── menu.js
```

---

## 8. Security Considerations

- Passwords are hashed using bcrypt before storage.
- Protected routes require valid authentication.
- Role-based authorization separates student and kitchen access.
- Students can access only their own orders.
- Order totals are calculated on the server.
- Payment webhooks require signature verification.
- Input validation is applied to user requests.
- Login and order endpoints should use rate limiting.
- Sensitive credentials are stored in `.env` and never committed to GitHub.

---

## 9. Development Plan

| Phase | Work |
|---|---|
| 1 | Project idea, requirements, and repository setup |
| 2 | System architecture and database design |
| 3 | Student and Kitchen dashboard development |
| 4 | Backend API and PostgreSQL integration |
| 5 | Order management and pickup slot functionality |
| 6 | Payment integration and live order updates |
| 7 | Testing, deployment, and documentation |

### Current Project Status

- [x] Problem identification and solution design
- [x] System architecture documentation
- [x] Database schema design
- [x] API route planning
- [x] Frontend prototype
- [x] Backend starter structure
- [ ] Complete PostgreSQL integration
- [ ] Real authentication
- [ ] Payment gateway integration
- [ ] Live order updates
- [ ] Deployment

---

## 10. Key Learnings

- Understanding how to identify a real-world problem and design a software solution.
- Planning database models and API routes before implementation.
- Understanding the separation between frontend and backend.
- Designing different dashboards based on user roles.
- Understanding order management and pickup slot capacity.
- Learning how database transactions can prevent overbooking.
- Understanding authentication, payment integration, and application security.
- Organizing a project using a professional GitHub repository structure.

---

*Developed as part of SWYNEX Technologies Internship – Task 1 .*
