Take the free course here:

[https://www.youtube.com/playlist?list=PLDjAbnn_RxMI6Tgr5r5aXJMrvsNND4F2p](https://www.youtube.com/playlist?list=PLDjAbnn_RxMI6Tgr5r5aXJMrvsNND4F2p)

Related libraries:

[https://github.com/ivan006/2024-05-wizweb-be/tree/main](https://github.com/ivan006/2024-05-wizweb-be/tree/main)

[https://github.com/ivan006/2024-05-wizweb-fe/tree/quasar](https://github.com/ivan006/2024-05-wizweb-fe/tree/quasar)

Notes for student:

```
<ifModule mod_rewrite.c>
    RewriteEngine On

    # Force HTTPS
    RewriteCond %{HTTPS} off
    RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

    RewriteBase /
    RewriteRule ^index\.html$ - [L]
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteRule . /index.html [L]
</ifModule>
```

# Read more

https://linktr.ee/aboutwizweb


# WizWeb Overview

## Mission  
The mission of WizWeb is to streamline platform development by providing tools that enable rapid and flexible creation of platforms. Its focus is on simplifying processes for developers while ensuring scalability and adaptability.

## Approach  
WizWeb follows an ability-driven development approach, abstracting reusable features ("abilities") from specific projects. This ensures that the effort put into building a platform extends to future projects, minimizing wasted effort and maximizing reusability.

---

## Technology  
WizWeb uses modern frameworks like Laravel for the back-end and Quasar with Vuex ORM for the front-end. These technologies enhance development efficiency and support a cohesive, model-driven architecture.

## Architecture  
The platform is structured as reusable front-end and back-end libraries, making it easy to integrate into various projects. This modular design shifts from project-specific setups to flexible tools that can adapt to different needs.

## Scaffolding  
WizWeb employs command-based scaffolding to automate tasks like generating migrations, models, controllers, and routes. This approach, paired with Laravel migrations, streamlines the development process and ensures consistency.

## Functionality  
WizWeb provides multiple data views and powerful tools for handling and displaying complex data.

- **TableView**: Displays data in a tabular format, ideal for structured lists and reports.  
- **GridView**: Includes high-level templating markup to efficiently structure grid items.  
- **MapView**: Displays data with geographic fields on interactive maps.  
- **CalendarView**: Presents data with time-based fields in a calendar format.  
- **TreeView**: Visualizes hierarchical, interrelated data effectively.  
- **Categorical Navigation**: A conceptual feature in development to organize data by categories.  
- **Grid Templating**: Allows custom, flexible layouts for grid items, enhancing visual organization.

