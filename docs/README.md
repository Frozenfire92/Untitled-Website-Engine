# Untitled-Website-Engine Documentation

The goal of this project is to make it easy to maintain a website with posts in a chronological order. It borrows from various UNIX philosophies as a core tenant:

> Portability over efficiency

Html + css are relatively easy to read by both humans and machines; it's been a well understood standard for decades. It will be the end result of any kind of templating engine; this project chooses to use them directly instead of any higher level abstractions. This decision is to make it easy to translate to a different language backend and keep your textual post data portable. Manual reconstruction of dist from the html/css inputs should be understandable.

## Directory Structure Overview
- `build/` - the output of the typescript compiler
- `dist/` - the website output from running the built script. Host/share this
- `docs/` - you are here
- `partials/` - common html that can be used as templates in the views
- `posts/` - where you will write your posts. Directory structure should match `views/`
- `public/` - store static assets like images here, they will be copied to `dist/`
- `src/` - the typescript source of the website engine
- `styles/` - the css source of your website. Ensure filenames are ordered as they are concatenated
- `views/` - the html route structure that will have content filled in
  - `views/*/index.html` - an end route the user will visit, often an index of posts
  - `views/*/_content.html` - if there are matching files in `posts/*/` they will use this template

## Environment Variables
- `BASE_URL` (default `/`) use this if you aren't hosting this at the root directory. ex: `BASE_URL=/Untitled-Website-Engine/ npm run build`

## Templating

To keep things productive but understandable, this project does need a few abstractions. Their scope is to be minimal and understandable.

### Directory Structure

The `views/` directory can be arbitrarily nested and structured as you like. The root `index.html` is the root index.html output. Within a nested structure you will generally have `index.html` files and `_content.html` files.

`_content.html` is a special template file that will be used when reading from the `posts/` directory under a matching structure. This file must contain the following comment which will be replaced with the post content:

```html
<!--# content #-->
```

Example directory:
```
views
├── blog
│   ├── _content.html
│   └── index.html
├── index.html
└── reviews
    ├── _content.html
    └── index.html
```
```
posts
├── blog
│   ├── 2019-12-28-some-story.html
│   └── 2019-12-31-example.html
└── reviews
    ├── 2019-11-01-some-movie.html
    └── 2019-12-01-some-tv-show.html
```
Will output the following
```
dist
├── blog
│   ├── 2019-12-28-some-story
│   │   └── index.html
│   ├── 2019-12-31-example
│   │   └── index.html
│   └── index.html
├── index.html
├── reviews
│   ├── 2019-11-01-some-movie
│   │   └── index.html
│   ├── 2019-12-01-some-tv-show
│   │   └── index.html
│   └── index.html
└── style.css
```

### Partials
You can put commonly used html inside files in the `partials` directory. You can then use these in your html files in `views` via a specially formatted comment with matching directory structure.

```html
<!--! partials/head.html !-->
```

### Index list
In the `index.html` file beside a `_content.html` file you can use the following comment to generate a list

```html
<!--# index #-->
```

will be replaced with something like:

```html
<ul>
  <li>
    <a href="/blog/2019-12-31-example">2019/12/31 - Example Blog Post</a>
  </li>
  <li>
    <a href="/blog/2019-12-28-some-story">2019/12/28 some story</a>
  </li>
</ul>
```
