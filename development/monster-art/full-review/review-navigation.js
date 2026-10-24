// GitHub HTML Preview injects a raw.githubusercontent.com <base>. Fragment and
// dynamically created page links must retain the HTTPS preview service wrapper.
(function(){
 function hash(value){const u=new URL(location.href);u.hash=value;return u.href;}
 function file(value){const target=new URL(value,document.baseURI);if(target.hostname==='htmlpreview.github.io')return target.href;if(location.hostname==='htmlpreview.github.io')return location.origin+location.pathname+'?'+target.href;return target.href;}
 window.ReviewLinks={hash,file};
})();
