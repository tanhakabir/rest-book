👉👉👉 This extension is still under development.

👉👉👉 Latest VS Code Insiders is required and at times this extension might be broken.

# REST Book

REST Book is a Visual Studio Code extension that allows you to perform REST calls in a Notebook interface.

![Example of REST Book notebook that REST calls made to an Express App](docs/images/express-app.png)

## Features

- Create and run REST Calls within cells.
- Organize multiple REST Calls within one file.
- Intermingle markdown for documenting your calls.
- View rich HTML and image responses directly inside the Notebook.
- Basic Authentication

## Requirements

Must be using the latest version of Visual Studio Code Insiders edition.

## Installation

1. Grab the latest VSIX file from the Releases section. 
1. Inside Visual Studio Code go under the Extensions section and click on the 3 ellipsis in the top right of the pane.
1. Click on `Install from VSIX...` and choose the downloaded VSIX.  
1. Close Visual Studio Code.
1. Using Powershell or Terminal run `code-insiders --enable-proposed-api rest-book <path to folder you want to run notebook in>`.


## Usage

1. Create a new file to store your REST Calls with a `.restbook` ending.
1. Add an code cell by hovering over the middle of the Notebook and clicking the `+ Code`
1. Add your intended URL as the first line of the cell. By default without specifying a method, it will be a GET call.

```javascript
google.com
```

is equivalent to:

```javascript
GET google.com
```

In subsequent lines immediately following the first line add any parameters or queries starting with `?` or `&` like this:

```javascript
GET https://www.google.com
    ?query="fun"
    &page=2
```

In the lines following without an empty line will be considered as the Request Headers:

```javascript
GET https://www.google.com
    ?query="fun"
    &page=2
User-Agent: rest-book
Content-Type: application/json 
```

The last lines after a new line separator is the body of the call. Like the following:

```javascript
POST https://www.myapi.com
User-Agent: rest-book
Content-Type: application/json 

{
    name: "Foo",
    text: "Foo is the most bar of the Foos" 
}
```

To test these interactions, you can play around with this simple server: [SandboxServer](https://github.com/tanhakabir/SandboxServer)

## Known Issues

When performing an incorrect query, currently the response will be empty and not an erroneous response.

## Any Other issues

Please submit your issue on the [tanhakabir/rest-book](https://github.com/tanhakabir/rest-book) repository with exact reproduction steps.
