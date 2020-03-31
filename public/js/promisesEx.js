/* eslint-disable */

const getIDs = new Promise((resolve, reject) => {
  setTimeout(()=> {
    const recipeId  = [434,545,655,767];
    resolve(recipeId); 
  },1500)  
});

const getRecipe = recID =>{
    return new Promise((resolve,reject) => {
    setTimeout((id) => {
      const recipe = {title: 'Tomato booom', publisher: 'Kyryll'}
      resolve(`${id}: ${recipe.title} !!`)
    },2000,recID)
  })
}
getIDs.then(IDs => { //IDs - result of the successfull promise
  console.log(IDs);
})