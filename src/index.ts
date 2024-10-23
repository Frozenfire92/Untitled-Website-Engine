import { promises as fsPromises } from 'fs';
const { readFile, writeFile, mkdir } = fsPromises;

import { listFiles, rmDirRecursive, copyFolder } from './utils/files';

const baseUrl = process.env['BASE_URL'] ?? '/';
const baseUrlRegex = /###BASE_URL###/gm;

async function main() {
  console.log('Untitled Website Engine\n');
  console.log('baseUrl: ', baseUrl);
  // Clean/Create dist directory
  await rmDirRecursive('dist');
  await mkdir('dist');
  // Compile the site
  await copyFolder('public', 'dist');
  await compileCss('styles', 'dist/style.css');
  await compileViews('views', 'partials', 'posts', 'dist');
  // await compileRSS('dist');
}

async function compileCss(inPath: string, outPath: string) {
  let finalText = '';

  let files = await listFiles(inPath);
  files.sort(); // seems like its always in order, but just incase
  for (let entry of files) {
    let file = await readFile(entry, 'utf-8');
    finalText += `${file}\n`;
  }
  
  //Replace baseUrl
  finalText = finalText.replace(baseUrlRegex, baseUrl);
  
  await writeFile(outPath, finalText);
}

// TODO break this up
async function compileViews(viewPath: string, partialPath: string, postsPath: string, outPath: string) {
  //#region Gather File Paths
  // Load file paths
  let viewsPaths = await listFiles(viewPath);
  let partialsPaths = await listFiles(partialPath);
  let postsPaths = await listFiles(postsPath);

  let contentPaths = viewsPaths
    .filter(n => n.endsWith('_content.html'))
    .map(n => n.replace(/^views\/?(.*?)\/([^\/]*?)\.html$/, '$1'));
  contentPaths = Array.from(new Set(contentPaths));

  let validPostsPaths = postsPaths
    .map(n => n.replace(/^posts\/?(.*?)\/([^\/]*?)\.html$/, '$1'));
  validPostsPaths = Array.from(new Set(validPostsPaths));

  let matchingPaths = validPostsPaths.filter(n => contentPaths.includes(n));

  postsPaths = postsPaths.filter(n => matchingPaths.some(m => n.startsWith(`posts/${m}`)))
  //#endregion

  //#region Load Partials
  let partials = [];
  for (const partial of partialsPaths) {
    let text = await readFile(partial, 'utf-8');
    partials.push({
      path: partial,
      text
    });
  }
  //#endregion

  // #region Load Posts
  let posts = [];
  for (const post of postsPaths) {
    let text = await readFile(post, 'utf-8');
    let prefix = matchingPaths.find(n => post.startsWith(`posts/${n}`));
    let withoutPrefix = post.replace(/^posts\//, '').replace(`${prefix}/`, '');
    let dateString = withoutPrefix.slice(0, 10)
    let date = new Date(dateString);
    let heading = text.match(/\<h2\>(.*?)\<\/h2\>/);
    posts.push({
      prefix,
      withoutPrefix,
      path: post,
      url: `${baseUrl}${prefix}/${withoutPrefix.replace('.html', '')}`,
      heading: heading && heading[1],
      name: heading
        ?  `${dateString.replace(/-/g, '/')} - ${heading[1]}`
        : withoutPrefix
          .replace(dateString, `${dateString.replace(/-/g, '/')}`)
          .replace('.html', '')
          .replace(/-/g, ' ')
          .trim(),
      date,
      text
    });
  }
  posts.sort((a, b) => b.date.getTime() - a.date.getTime());
  //#endregion

  //#region Output Directory Setup
  let neededSubPaths = [
    ...viewsPaths
      .map(n => n.replace(/^views\/?(.*?)\/([^/]*?)\.html$/, '$1'))
      .filter(n => n.length)
      .map(n => `${outPath}/${n}`),
    ...posts.map(n => `${outPath}/${n.url.replace(baseUrl, '/').replace(/^\//, '')}`)
  ];
  neededSubPaths = Array.from(new Set(neededSubPaths));
  
  for (const path of neededSubPaths) {
    await mkdir(path, { recursive: true });
  }
  //#endregion

  for (const view of viewsPaths) {
    let file = await readFile(view, 'utf-8');
    let match;
    let matches = [];

    //#region Replace partials found in the file
    let partialRegex = /^(\s*)<!--!(.*?)!-->/gm;
    while (match = partialRegex.exec(file)) {
      matches.push(match);
    }

    for (const match of matches) {
      let partial = partials.find(n => n.path === match[2].trim());
      if (partial) {
        // TODO this needs the start of line replacement and the post below doesn't :thinking:
        let cleanedPartial = partial.text.replace(/^(.*?)/, `${match[1]}$1`).replace(/\n/gi, `\n${match[1]}`);
        file = file.replace(match[0], cleanedPartial);
      }
      else {
        console.log('didnt find partial :scream:', match);
      }
    }
    //#endregion

    // If the view is a content path, we are going to replace the content
    if (view.endsWith('_content.html')) {
      for (const post of posts.filter(n => view === `views/${n.prefix}/_content.html`)) {
        matches = [];
        let _file = file;

        // Replace content variable with post text
        let contentRegex = /^(\s*)<!--# content #-->/gm;
        while (match = contentRegex.exec(file)) {
          matches.push(match);
        }
        for (const match of matches) {
          let cleanedPost = post.text.replace(/\n/gi, `\n${match[1]}`);
          _file = _file.replace('<!--# content #-->', cleanedPost);
        }

        // Replace title with post name
        _file = _file.replace('</title>', ` | ${post.heading || post.name}</title>`);

        let filePath = `${outPath}${post.url.replace(baseUrl, '/')}/index.html`

        //Replace baseUrl
        _file = _file.replace(baseUrlRegex, baseUrl);

        await writeFile(filePath, _file);
      }
    }
    else {
      matches = [];
      let _file = file;
      // Replace index list
      let contentRegex = /^(\s*)<!--# index #-->/gm;
      while (match = contentRegex.exec(_file)) {
        matches.push(match);
      }
      for (const match of matches) {
        let matchingPosts = posts.filter(n => view.startsWith(`views/${n.prefix}/`))
        _file = _file.replace(
          '<!--# index #-->',
          `<ul>${matchingPosts.map(n => `<li><a href="${n.url}">${n.name}</a></li>`).join('')}</ul>`
        );
      }

      //Replace baseUrl
      _file = _file.replace(baseUrlRegex, baseUrl);

      await writeFile(`${outPath}${view.replace(/^views/, '')}`, _file);
    }
  }
}

main();
