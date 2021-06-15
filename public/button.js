console.log("Client Sided JS")
let points = 0;
let pointBut = document.getElementById('PointsXX');
pointBut.innerText = `${points} Points`


const buttons = document.getElementsByClassName('addPoints')

document.addEventListener('click', addBut);

console.log(buttons);



function addBut (buttons) {
    points = 0;
    buttons = document.getElementsByClassName('addPoints');
    for( var i=0; i<buttons.length; i++){
        if(buttons[i].checked === true){
            points += parseInt( buttons[i].defaultValue);
            pointBut.innerText = `${points} Points`;

            if(points < 15){
               pointBut.className = "badge bg-success";
            }
            if(points >=15 && points < 25){
                pointBut.className = "badge bg-warning";
             }
             if(points >= 25){
                pointBut.className = "badge bg-danger";
             }
        }
    }
    
}