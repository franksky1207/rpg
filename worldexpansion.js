(function(){
 const baseHomePageForWorld=homePage;
 homePage=function(){return baseHomePageForWorld().replace("純文字 RPG","文明戰線");};
 document.title="文明戰線";
 const brand=document.getElementById("brandTitle");
 if(brand)brand.textContent="文明戰線";
 setTimeout(()=>{if(typeof render==="function")render();},0);
})();
