# Untitled-Website-Engine
A simple solution to writing your own blog or website that uses no external dependencies and is highly customizable. Well defined format so backends can be created easily; currently only in typescript.

## Installation
- Prereq: nodejs/npm
- clone/fork/download this repository and `cd` into it
- `npm install` (typescript is the only dependency)

## Usage
- Start writing in `posts/` and use the file format `year-month-day-title-dasherized.html`.
- You can customize how things look via css in `styles/`. These get concatenated so ensure filenames are ordered.
- You can change the structure of the html in `views/` and `partials/`
- run the build script via `npm run build`

## Directory Structure
- `build/` - the output of the typescript compiler
- `dist/` - the website output from running the built script. Host/share this
- `partials/` - common html that can be used as templates in the views
- `posts/` - where you will write your posts. Directory structure should match `views/`
- `views/` - the html route structure that will have content filled in
  - `views/*/index.html` - an end route the user will visit, often an index of posts
  - `views/*/_content.html` - if there are matching files in `posts/*/` they will use this template
- `src/` - the source of the website engine

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License
[MIT](https://choosealicense.com/licenses/mit/)
