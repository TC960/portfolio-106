let pages = [
  { url: '', title: 'Home' },
  { url: 'projects/', title: 'Projects' },
  { url: 'resume/', title: 'Resume' },
  { url: 'contact/', title: 'Contact Me' },
  { url: 'https://github.com/TC960', title: 'GitHub' }
];

let nav = document.createElement('nav');
document.body.prepend(nav);

const BASE_PATH = (location.hostname === "localhost" || location.hostname === "127.0.0.1")
  ? "/"                  
  : "/portfolio-106/";       
  
for (let p of pages) {
  let url = p.url;
  let title = p.title;
  
  if (!url.startsWith('http')) {
    url = BASE_PATH + url;
  }
  
  let a = document.createElement('a');
  a.href = url;
  a.textContent = title;
  
  if (a.host === location.host && a.pathname === location.pathname) {
    a.classList.add('current');
  }
  
  if (a.host !== location.host) {
    a.target = "_blank";
  }
  
  nav.append(a);
}