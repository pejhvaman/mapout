# Workout Tracker

> This Workout Tracker is a single-page application designed to help users log and visualize their workouts on an interactive map and in a structured list. Built with object-oriented programming (OOP) principles, the app leverages localStorage to persist workout data across sessions.

## Key Features:

- Track two types of workouts (e.g., running and cycling)
- Display workouts on a map and in a sortable list
- Data persistence using localStorage
- Responsive layout using CSS3

## Upcoming Enhancements:

- Delete individual workouts or clear all workouts ✅Implemented
- Edit workouts to adjust details
- Sort workouts based on specific criteria
- Restore objects from localStorage after page reload ✅Implemented
- More intuitive UI messages and confirmations for better user experience ✅Implemented
- Ability to position the map to show all workouts

### Upcoming advanced features:

- Ability to draw lines and shapes
- Geocode location from cordinates to show a better description of location (ex: Bury Road in London, England)
- Display weather data for workout time and place
- Add user authentication.
- Implement a database for cloud storage.
- Improve UI/UX with animations.

> This project is a work in progress, with continuous improvements planned for better functionality and user experience.


> ## Installation
1. Clone the repository:
   ```sh
   git clone https://github.com/pejhvaman/mapout.git
   ```
2. Navigate to the project folder:
   ```sh
   cd mapout
   ```
3. Install dependencies:
   ```sh
   npm install
   ```
4. Run the development server:
   ```sh
   npm start
   ```
5. Build the project for production:
   ```sh
   npm run build
   ```

## Usage
- Click on the map to add a new workout.
- Fill in workout details (e.g., type, duration, distance, etc.).
- View workouts in the list.
- Click on a workout to edit or delete it.
- Use the "Delete All" option to clear all workouts.

## Technologies Used
- **JavaScript (ES6+)**
- **Webpack** for bundling
- **Leaflet.js** for maps
- **Local Storage** for data persistence
- **CSS3** for styling
- **Toastify-js** for UI messages

