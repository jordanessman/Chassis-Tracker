const express = require('express');
const app = express();
const path = require('path');
var bodyParser = require('body-parser');
const fs = require("fs");
const { stringify } = require('qs');
const Chassis = require('./models/chassis.js');
const Box = require('./models/Box.js');
const Carrier = require('./models/Carrier.js');
const Lease = require('./models/Lease.js');
const Repair = require('./models/Repair.js');
const RepairItem = require('./models/RepairItem.js');
const methodOverride = require('method-override')
//const mongoDBStore = require('connect-mongo')(session);
const user = require('./models/user.js');
const pass = "Nextier101!";
const username = "nextier"
const pass1 = "NextierSand1!";
const username1 = "nextiersand"
const session = require('express-session');

const mongoose = require ("mongoose");
const { findById } = require('./models/chassis.js');
const repair = require('./models/Repair.js');
// mongoose.connect('mongodb://localhost:27017/journeyManagement', {useNewUrlParser: true, useUnifiedTopology: true}) 
//.then(()=> {
 //   console.log("Mongo Connection Open")
//})
//.catch(err => {
//console.log('error')
//})
mongoose.connect('mongodb+srv://nexhub:Nextier1@cluster0.kia7r.mongodb.net/myFirstDatabase?retryWrites=true&w=majority',{
    useNewUrlParser : true,
    useCreateIndex : true,
    useUnifiedTopology : true,
    useFindAndModify : false
})
// console.log(dbURL)




app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')
app.use(express.urlencoded({extended : true}))
app.use(express.json());
app.use(express.static('public'));
app.use(express.static(__dirname + '/public'));
app.use(methodOverride('_method'))
app.use(session({secret: 'nope'}));

app.get('/LOGIN', (req, res) => {
    res.render('login.ejs')
})

app.post('/LOGIN', (req, res) =>{
    const {uName, pWord} = req.body
    console.log(uName);
    console.log(pWord);
    if(validPass(uName, pWord)) {
    req.session.user_id = uName;
    console.log(req.session.user_id);
    res.redirect('/Home');
    }
    else if (validPass1(uName, pWord)) {
        req.session.user_id = uName;
        console.log(req.session.user_id);
        res.redirect('/Home');
        } 
    else{ res.render("Incorrect Password")}
})

app.get('/Chassis', async (req, res) =>{
    if(req.session.user_id !== username){
        res.redirect('/LOGIN');
    }
    else{
    app.engine('html', require('ejs').renderFile);
    app.set('view engine', 'html');
    const carrier = await Carrier.find();
    res.render('Chassis.ejs', {carrier})
    }
})

app.get('/Box', async (req, res) =>{
    if(req.session.user_id !== username1){
        res.redirect('/LOGIN');
    }
    else{
    app.engine('html', require('ejs').renderFile);
    app.set('view engine', 'html');
    const carrier = await Carrier.find();
    res.render('Box.ejs', {carrier})
    }
})

app.post('/Chassis', async (req, res) =>{
    if(req.session.user_id !== username){
        res.redirect('/LOGIN');
    }
    else{
    let hold = req.body
    const lease = await Lease.find();
    const chass = await Chassis.find();
    if (await checkLease(lease, hold) === true) {
        console.log('Chassis no lease')
        res.send('Chassis already has a current lease. Please see chassis inventory.')
    }
    else if (await checkTag(chass, hold) === true) {
        console.log('tagged out');
        res.send('Chassis has been tagged out. You need permission to check this chassis out. Please tag the chassis back in before creating a lease.');
    }
    else if (await checkChass(chass, hold) === false) {
        console.log('chassis not in inventory');
        res.send('Chassis is not in the current inventory. Please add the chassis to the inventory before creating a lease.');
    }
    else{
        saveData(hold, chass, lease);
        res.redirect('/Active');
    }
}
 })

 app.post('/Box', async (req, res) =>{
    if(req.session.user_id !== username1){
        res.redirect('/LOGIN');
    }
    else{
    let hold = req.body
    const box = await Box.find();
    const carrier = await Carrier.find();
    console.log(hold);
    saveDataBox(hold, box);
    res.redirect('/ActiveBox');
    }
 })

 app.get('/Return', async (req, res) =>{
    if(req.session.user_id !== username){
        res.redirect('/LOGIN');
    }
    else{
    const carrier = await Carrier.find();
    res.render('Return.ejs', {carrier})
    }
})

app.get('/ReturnInvChass', async (req, res) =>{
    if(req.session.user_id !== username){
        res.redirect('/LOGIN');
    }
    else{
    const carrier = await Carrier.find();
    res.render('ReturnInvChass.ejs', {carrier})
    }
})

app.get('/ReturnBox', async (req, res) =>{
    if(req.session.user_id !== username1){
        res.redirect('/LOGIN');
    }
    else{
    const carrier = await Carrier.find();
    res.render('ReturnBox.ejs', {carrier})
    }
})

app.post('/Return', async (req, res) =>{
    if(req.session.user_id !== username){
        res.redirect('/LOGIN');
    }
    else{
    let tA = await Lease.find();
    const carrier = await Carrier.find();
    const chass = await Chassis.find();
    let hold = req.body;
    if (checkLease(tA, hold) === false) {
        console.log('false')
        res.send('Chassis does not have a lease. Please see chassis inventory.')
    }
    else{
        complete(tA, hold, chass);
    res.redirect('/Log')
    }   
}
})


app.post('/ReturnBox', async (req, res) =>{
    if(req.session.user_id !== username1){
        res.redirect('/LOGIN');
    }
    else{
    let tA = await Box.find();
    const carrier = await Carrier.find();
    let hold = req.body;
    console.log(hold);
    completeBox(tA, hold)
    res.redirect('/LogBox')
    }
})


 app.get('/Active', async (req, res) => {
    if(req.session.user_id !== username){
        res.redirect('/LOGIN');
    }
    else{
     const chass = await Lease.find();
     const carrier = await Carrier.find();
     hold = req.body;
    res.render('active.ejs', {carrier, chass})
    }
})

app.get('/ActiveBox', async (req, res) => {
    if(req.session.user_id !== username1){
        res.redirect('/LOGIN');
    }
    else{
    const box = await Box.find();
    const carrier = await Carrier.find();
   res.render('ActiveBox.ejs', {carrier, box})
    }
})

app.post('/Active', async (req, res) => {
    if(req.session.user_id !== username){
        res.redirect('/LOGIN');
    }
    else{
    const chass = await Lease.find();
    const carrier = await Carrier.find();
    hold = req.body;
   res.render('activeWCarrier.ejs', {carrier, chass, hold})
    }
})

app.post('/ActiveBox', async (req, res) => {
    if(req.session.user_id !== username1){
        res.redirect('/LOGIN');
    }
    else{
    const box = await Box.find();
    const carrier = await Carrier.find();
    hold = req.body;
   res.render('activeBoxWCarrier.ejs', {carrier, box, hold})
    }
})

app.get('/Log', async (req, res) => {
    if(req.session.user_id !== username){
        res.redirect('/LOGIN');
    }
    else{
    const chass = await Lease.find();
    const carrier = await Carrier.find();
    res.render('logNoDate.ejs', {carrier, chass})
    }
})

app.get('/LogBox', async (req, res) => {
    if(req.session.user_id !== username1){
        res.redirect('/LOGIN');
    }
    else{
    const chass = await Box.find();
    const carrier = await Carrier.find();
    res.render('logNoDateBox.ejs', {carrier, chass})
    }
})

app.post('/Log', async (req, res) => {
    if(req.session.user_id !== username){
        res.redirect('/LOGIN');
    }
    else{
    const chass = await Lease.find();
    const carrier = await Carrier.find();
    hold = req.body;
    res.render('logCarrier.ejs', {carrier, chass, hold})
    }
})

app.post('/LogBox', async (req, res) => {
    if(req.session.user_id !== username1){
        res.redirect('/LOGIN');
    }
    else{
    const chass = await Box.find();
    const carrier = await Carrier.find();
    hold = req.body;
    res.render('LogCarrierBox.ejs', {carrier, chass, hold})
    }
})

app.get('/addCarrier', async (req, res) => {
    if(req.session.user_id !== username){
        res.redirect('/LOGIN');
    }
    else{
    const carrier = await Carrier.find();
    res.render('addCarrier.ejs', {carrier})
    }
})

app.post('/addCarrier', async (req, res) => {
    if(req.session.user_id !== username){
        res.redirect('/LOGIN');
    }
    else{
    const carrier = await Carrier.find();
    hold = req.body;
    addCarrier(carrier, hold);
    res.send('Carrier Added')
    }
})

app.get('/addChassis', async (req, res) => {
    if(req.session.user_id !== username){
        res.redirect('/LOGIN');
    }
    else{
    const carrier = await Carrier.find();
    res.render('addChassis.ejs', {carrier})
    }
})

app.post('/addChassis', async (req, res) => {
    if(req.session.user_id !== username){
        res.redirect('/LOGIN');
    }
    else{
    const chassis = await Chassis.find();
    hold = req.body;
    console.log(hold);
    console.log(chassis);
    if (checkChass(chassis, hold) === true) {
        console.log('true')
        res.send('Chassis is already on the active list. Please see chassis inventory.')
    }
    else{
    addChassis(chassis, hold);
    res.send('Chassis Added')
    }
}
})

app.get('/ChassInv', async (req, res) => {
    if(req.session.user_id !== username){
        res.redirect('/LOGIN');
    }
    else{
    const chass = await Chassis.find();
    hold = req.body;
    let num = 3;
   res.render('chassInv.ejs', {chass, hold, num})
    }
})

app.post('/ChassInv', async (req, res) => {
    if(req.session.user_id !== username){
        res.redirect('/LOGIN');
    }
    else{
    const chass = await Chassis.find();
    hold = req.body;
    let num = 3;
   res.render('chassInv.ejs', {chass, hold, num})
    }
})

app.get('/ChassInvReturn', async (req, res) => {
    if(req.session.user_id !== username){
        res.redirect('/LOGIN');
    }
    else{
    const chass = await Chassis.find();
   res.render('chassInvReturn.ejs', {chass})
    }
})

app.post('/ReturnInvChass', async (req, res) =>{
    if(req.session.user_id !== username){
        res.redirect('/LOGIN');
    }
    else{
    let tA = await Lease.find();
    const carrier = await Carrier.find();
    const chass = await Chassis.find();
    let hold = req.body;
    if (checkChass(chass, hold) === false) {
        console.log('false')
        res.send('Chassis is not in inventory. Please see chassis inventory.')
    }
    else{
    completeChassInv(chass, hold)
    res.redirect('/ChassInvReturn')
    }  
} 
})

app.get('/Tag', async (req, res) => {
    if(req.session.user_id !== username){
        res.redirect('/LOGIN');
    }
    else{
    const chass = await Chassis.find();
   res.render('Tag.ejs', {chass})
    }
})

app.post('/Tag', async (req, res) =>{
    if(req.session.user_id !== username){
        res.redirect('/LOGIN');
    }
    else{
    const chass = await Chassis.find();
    let hold = req.body;
    if (checkChass(chass, hold) === false) {
        console.log('false')
        res.send('Chassis is not in inventory. Please check the Chassis number is correct, or enter the new chassis into inventory.')
    }
    else{
    tagout(chass, hold)
    res.redirect('/ChassInv')
    }  
} 
})

app.get('/Repairs', async (req, res) => {
    if(req.session.user_id !== username){
        res.redirect('/LOGIN');
    }
    else{
    const repairs = await Repair.find();
    const chass = await Chassis.find();
   res.render('repairs.ejs', {repairs, chass})
    }
})

app.get('/createRepair', async (req, res) => {
    if(req.session.user_id !== username){
        res.redirect('/LOGIN');
    }
    else{
    const repairItem = await RepairItem.find();
   res.render('makeRepairRequest.ejs', {repairItem})
    }
})

app.get('/completeRepair', async (req, res) => {
    if(req.session.user_id !== username){
        res.redirect('/LOGIN');
    }
    else{
    const repairItem = await RepairItem.find();
    const repair = await Repair.find();
   res.render('completeRepair.ejs', {repairItem, repair})
    }
})

app.post('/completeRepair', async (req, res) => {
    if(req.session.user_id !== username){
        res.redirect('/LOGIN');
    }
    else{
    hold = req.body;
    const repair = await Repair.find();
    completeRepair(repair, hold);
    res.send('Item Category Added')
    }
})

app.post('/createRepair', async (req, res) => {
    if(req.session.user_id !== username){
        res.redirect('/LOGIN');
    }
    else{
    const repair = await Repair.find();
    hold = req.body;
    createRepair(repair, hold);
    res.send('Repair request has been created.')
    }
})

app.get('/addRepairItem', async (req, res) => {
    if(req.session.user_id !== username){
        res.redirect('/LOGIN');
    }
    else{
    res.render('addRepairItem.ejs', {})
    }
})

app.post('/addRepairItem', async (req, res) => {
    if(req.session.user_id !== username){
        res.redirect('/LOGIN');
    }
    else{
    const repairItem = await RepairItem.find();
    hold = req.body;
    addRepairItem(repairItem, hold);
    res.send('Item Category Added')
    }
})

app.use('/',(req, res) => {
        res.render('nexHubHome.ejs')
})

const port = process.env.PORT || 3000

app.listen(port, () =>{
    console.log(port);
})



async function saveData(hold, chass, lease){
    lease = {};
    lease.chass = hold.chass;
    lease.chassType = hold.chassisType;
    lease.carrier = hold.carrier;
    lease.driver = hold.driver;
    lease.truckNum = hold.truckNum;
    lease.pickupDate = hold.pickupDate;
    lease.pickupTime = hold.pickupTime;
    lease.picture = hold.picture;
    lease.submissionDate = `${new Date()}`;
    lease.status = true;

    const n = new Lease(lease);
    await n.save();

    for (let i = 0; i < chass.length; i++) {
        if (chass[i].chass === hold.chass) {
            if (chass[i].status === true) {
               await Chassis.findByIdAndUpdate({_id : chass[i]._id} , { leaseStatus : true });
            }  
        }
    }
    
}

async function saveDataBox(hold){
    box = {};
    box.box = hold.box;
    box.box2 = hold.box2;
    box.boxType = hold.boxType;
    box.carrier = hold.carrier;
    box.driver = hold.driver;
    box.truckNum = hold.truckNum;
    box.pickupDate = hold.pickupDate;
    box.pickupTime = hold.pickupTime;
    box.chass = hold.chass;
    box.submissionDate = `${new Date()}`;
    box.status = true;
    console.log(box);
    const n = new Box(box);
    await n.save();
}

async function complete(tA, hold, chass){
    for(i=0;i < tA.length; i++){
        if(tA[i].chass === hold.chass){
            if(tA[i].carrier === hold.carrier){
                    if(tA[i].status === true){ 
                       const {id} = {id : tA[i]._id} 
                       tA[i].returnDriver = hold.returnDriver;
                       tA[i].returnTruckNum = hold.returnTruckNum;
                       tA[i].returnDate = hold.returnDate;
                        tA[i].returnTime = hold.returnTime;
                        tA[i].status = false;
                        tA[i].completionSubTime = `${new Date()}`;
                        const n = await Lease.findByIdAndUpdate({_id: tA[i]._id}, tA[i], {new : true},function(err, updatedProfile){
                            if(err) { console.log(err)}});
                        console.log(hold.chass);
                        for (let j = 0; j < chass.length; j++) {
                            console.log(chass[j].chass);
                        if (chass[j].chass === hold.chass) {
                               await Chassis.findByIdAndUpdate({_id : chass[j]._id} , { leaseStatus : false, returnDate: hold.returnDate});
            }}            
            }
        }
    }}}

   

    async function completeBox(tA, hold){
        for(i=0;i < tA.length; i++){
            if(tA[i].box === hold.box || tA[i].box === hold.box2){
                if(tA[i].carrier === hold.carrier){
                        if(tA[i].status === true){ 
                           const {id} = {id : tA[i]._id} 
                           tA[i].returnDate = hold.returnDate;
                            tA[i].returnTime = hold.returnTime;
                            tA[i].returnTruckNum = hold.returnTruckNum;
                            tA[i].status = false;
                            tA[i].completionSubTime = `${new Date()}`;
                            console.log(id)
                            const n = await Box.findByIdAndUpdate({_id: tA[i]._id}, tA[i], {new : true},function(err, updatedProfile){
                                if(err) { console.log(err)}});
                            console.log(n)
                }}            
                }
            }
        }

        async function  completeRepair (repair, hold){
            for(i=0;i < repair.length; i++){
                if(repair[i].chass === hold.chass) {
                    if(repair[i].repairItem === hold.repairItem){
                        await Repair.findByIdAndUpdate({_id : repair[i]._id} , { status : false, repairDate: hold.repairDate, mechanic: hold.mechanic});
        }}}}
    
        async function addCarrier(carrier, hold){
            carrier = {};
            carrier.carrier = hold.carrier;
            carrier.password = hold.password;
            const n = new Carrier(carrier);
            await n.save();
        }

        async function addRepairItem(repairItem, hold){
            repairI = {};
            repairI.repairItem = hold.repairItem;
            const n = new RepairItem(repairI);
            await n.save();
        }

        async function createRepair(repair, hold){
            repair = {};
            repair.chass = hold.chass;
            repair.chassType = hold.chassType;
            repair.repairItem = hold.repairItem;
            repair.notes = hold.notes;
            repair.repairRequestDate = `${new Date()}`;
            repair.status = true;
            const n = new Repair(repair);
            await n.save();
        }

        async function addChassis(chassis, hold){
            chassis = {};
            chassis.chass = hold.chass;
            chassis.chassType = hold.chassType;
            chassis.pickupDate = hold.pickupDate;
            chassis.returnDate = hold.returnDate;
            chassis.leaseStatus = false;
            chassis.status = true;
            const n = new Chassis(chassis);
            await n.save();
        }

        function checkChass(chassis, hold){
            for (let i = 0; i < chassis.length; i++) {
                if (chassis[i].chass === hold.chass) {
                    if (chassis[i].status === true){
                    return true;
                }}
                
            }
            return false;
        }

        function checkLease(lease, hold){
            for (let i = 0; i < lease.length; i++) {
                if (lease[i].chass === hold.chass) {
                    if (lease[i].status === true)
                    return true;
                }
                
            }
            return false;
        }

    async  function  completeChassInv(chass, hold){
            for (let j = 0; j < chass.length; j++) {
                console.log(hold);
            if (chass[j].chass === hold.chass) {
                   await Chassis.findByIdAndUpdate({_id : chass[j]._id} , { status : false });
                   await Chassis.findByIdAndUpdate({_id : chass[j]._id} , { returnDate : hold.returnDate });
}}            
        }

        function validPass(uName, pWord) {
            if(uName === username){
            if(pass === pWord) {
                return true;
            }
            else{
                return false;
            }}
        }

        function validPass1(uName, pWord) {
            if(uName === username1){
            if(pass1 === pWord) {
                return true;
            }
            else{
                return false;
            }}
        }

        async function tagout(chass, hold){
            for (let j = 0; j < chass.length; j++) {
                console.log(hold);
            if (chass[j].chass === hold.chass) {
                console.log(chass[j].tagged);
                if(chass[j].tagged === false || !chass[j].tagged) {
                   await Chassis.findByIdAndUpdate({_id : chass[j]._id} , { tagged : true });
                   console.log('true')
            }
            else{
                await Chassis.findByIdAndUpdate({_id : chass[j]._id} , { tagged : false });
                console.log("false")
            }   
        }}}

       async function checkTag(chass, hold) {
        for (let i = 0; i < chass.length; i++) {
            if (chass[i].chass === hold.chass) {
                if (chass[i].tagged === true){
                return true;
            }}
            
        }
        return false;
    }