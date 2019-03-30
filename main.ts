import * as BABYLON from 'babylonjs';

// Get the canvas DOM element
const canvas:HTMLCanvasElement = <HTMLCanvasElement>document.getElementById('renderCanvas');
let scene:BABYLON.Scene;
let sphere:BABYLON.Mesh;
let camera:BABYLON.Camera;
let lockAdder:boolean = false;

const Player = {
    sphere,
    movementState: {
        moveRight:false,
        moveLeft:false,
        moveUp:false,
        moveDown:false
    }
}

const Camera = {
    camera
}

interface GBounds {
    maxX: number,
    maxZ: number,
    minX: number,
    minZ: number

}
interface Tiles {
    enumerator: number,
    currentIndex: number,
    addTile: Function,
    calculateBounds: Function,
    tiles: Array<BABYLON.Mesh>
    bounds: GBounds
}
const Tiles:Tiles = {
    enumerator: 0,
    currentIndex: 0,
    addTile: function (width:number, height:number, axis:string, isNegative:boolean) { 
        if(lockAdder) return null;
        lockAdder = true;
        console.log("addTile", Tiles.enumerator);
        let ground:BABYLON.Mesh = BABYLON.Mesh.CreateGround(`ground${Tiles.enumerator}`, width, height, 2, scene, false);
        if(Tiles.enumerator > 0 )
        {
            const currentTile = Tiles.tiles[Tiles.currentIndex];
            if(axis == 'x') {
                if(isNegative) {
                    ground.translate(BABYLON.Axis.X, currentTile.position.x - width);
                }
                else {
                    ground.translate(BABYLON.Axis.X,  currentTile.position.x + width); 
                }
                ground.translate(BABYLON.Axis.Z, currentTile.position.z);
                /*
                const zPlayer = Player.sphere.position.z;
                const zTile   = Tiles.tiles.filter( t => {
                    
                    const {minimum, maximum} = t.getBoundingInfo().boundingBox;
                    //console.log('zPlayer: ' + zPlayer, t.position.z, minimum, maximum);
                    //console.log(t.position.z + maximum.z , t.position.z + minimum.z);
                    return zPlayer <= t.position.z + maximum.z && zPlayer >= t.position.z + minimum.z;
                })[0];
                ground.translate(BABYLON.Axis.Z, zTile.position.z);*/
            }
            if(axis == 'z') {
                if(isNegative)
                    ground.translate(BABYLON.Axis.Z, currentTile.position.z  - ( height  ));
                else
                    ground.translate(BABYLON.Axis.Z, currentTile.position.z  + (height ));
                console.log('currentTile data:', Tiles.currentIndex, currentTile, currentTile.position.x);
                ground.translate(BABYLON.Axis.X, currentTile.position.x);
            }
        }
        Tiles.tiles.push(ground);
        Tiles.enumerator++;
        
        setTimeout(function () { 
            Tiles.calculateBounds();
            //console.log(Tiles.bounds);
            lockAdder = false;
        }, 100);

       

    },
    calculateBounds: function () {
        Tiles.tiles.forEach( obj => { 
            const bounds = obj.getBoundingInfo();
            const {boundingBox} = bounds;
            //console.log(obj.name, obj.position, boundingBox);
            if(boundingBox.maximumWorld.x > Tiles.bounds.maxX)
                Tiles.bounds.maxX = boundingBox.maximumWorld.x;
            if(boundingBox.maximumWorld.z > Tiles.bounds.maxZ)
                Tiles.bounds.maxZ = boundingBox.maximumWorld.z;
            
            if(boundingBox.minimumWorld.x < Tiles.bounds.minX)
                Tiles.bounds.minX = boundingBox.minimumWorld.x;
            if(boundingBox.minimumWorld.z < Tiles.bounds.minZ)
                Tiles.bounds.minZ = boundingBox.minimumWorld.z;
            
        });
        //console.log("after calculation",Tiles.bounds);
    },
    tiles: [],
    bounds: {
        maxX:0,
        maxZ: 0,
        minX: 0,
        minZ: 0,
    }
}


const MoveActions = [
    {key: 'w', state: 'moveUp',   axis:'Z', negative:false, checkAgainst: 'maxZ'},
    {key:'s', state: 'moveDown',  axis:'Z', negative:true,  checkAgainst: 'minZ'},
    {key:'d', state: 'moveRight', axis:'X', negative:false, checkAgainst: 'maxX'},
    {key:'a', state: 'moveLeft',  axis:'X', negative:true,  checkAgainst: 'minX'}
];

const setCurrentTile = function () {
/*
    const {currentIndex, tiles} = Tiles;
    let smallIndex,bigIndex;
    smallIndex = currentIndex;
    bigIndex   = currentIndex;
    if(currentIndex > 0)
        smallIndex = currentIndex - 1;
    if(currentIndex < tiles.length - 1)
        bigIndex = currentIndex + 1;
    const tilesAfter:any =  Tiles.tiles.slice(smallIndex, bigIndex+1);
    Tiles.currentIndex = tilesAfter.findIndex( (o) => {
        const pPosition = Player.sphere.position;
        const {minimumWorld, maximumWorld} = o.getBoundingInfo().boundingBox;
        console.log(pPosition, minimumWorld, maximumWorld);
        return pPosition.x >=  minimumWorld.x && pPosition.x <= maximumWorld.x && pPosition.z >= minimumWorld.z && pPosition.z <= maximumWorld.z;
    });
    if(Tiles.currentIndex < 0 )
        Tiles.currentIndex = 0;

    
  */  
   const lastIndex = Tiles.currentIndex;
   const tiles:any = Tiles.tiles;
   const nextIndex:number  = tiles.findIndex( (o) => {
        const pPosition = Player.sphere.position;
        const {minimumWorld, maximumWorld} = o.getBoundingInfo().boundingBox;
        //console.log(pPosition, minimumWorld, maximumWorld);
        return pPosition.x >=  minimumWorld.x && pPosition.x <= maximumWorld.x && pPosition.z >= minimumWorld.z && pPosition.z <= maximumWorld.z;
    });
    Tiles.currentIndex = nextIndex > -1 ? nextIndex : lastIndex;
    console.log(Tiles.currentIndex);

}
const checkBounds = function(axis: String, checkAgainst: String, isNegative: boolean) {
    let retVal:boolean; 
    if(isNegative)
        retVal = Player.sphere.position[axis.toLowerCase()] >= Tiles.bounds[checkAgainst.toString()];
    else
        retVal =  Player.sphere.position[axis.toLowerCase()] <= Tiles.bounds[checkAgainst.toString()]; 
    /*if(!retVal) {
        Tiles.addTile(6,6, axis.toLowerCase().toString(), isNegative);
    }*/
    
    return retVal;
}   
const checkBoundsLocal = function(axis:String, isNegative: boolean) {

    let retVal: boolean;
    const pPos = Player.sphere.position;
    const {minimumWorld, maximumWorld} = Tiles.tiles[Tiles.currentIndex].getBoundingInfo().boundingBox;
    retVal =  pPos.x >=  minimumWorld.x && pPos.x <= maximumWorld.x && pPos.z >= minimumWorld.z && pPos.z <= maximumWorld.z;
    if(!retVal)
        Tiles.addTile(6,6, axis.toLowerCase().toString(), isNegative);
    return retVal;
    
}
let gamepadManager:BABYLON.GamepadManager;
// Load the 3D engine
var engine = new BABYLON.Engine(canvas, true, {preserveDrawingBuffer: true, stencil: true});
var createController = function () { 
    scene.actionManager = new BABYLON.ActionManager(scene);
    scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyDownTrigger, (evt) => {
        //console.log(Player.sphere.position, Tiles.bounds);
        MoveActions.forEach(o => {
            if(evt.sourceEvent.key == o.key) {
                let test1 = checkBoundsLocal(o.axis, o.negative);
                Player.movementState[o.state] = true && checkBounds(o.axis, o.checkAgainst, o.negative) && test1;
                setCurrentTile();
            }
        })
    
    }));
    scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyUpTrigger, (evt) => {
        MoveActions.forEach(o => {
            
            if(evt.sourceEvent.key == o.key)
                Player.movementState[o.state] = false;
        })
    }));
    scene.registerBeforeRender(function(){
        if(!scene.isReady()) return;

        if(Player.sphere){
            
            const MOVE_SPEED = 0.1;
            MoveActions.map(o => {
                if(Player.movementState[o.state]) {
                    Player.sphere.translate(BABYLON.Axis[o.axis], MOVE_SPEED * (o.negative ? -1 : 1), BABYLON.Space.LOCAL );
                    //Camera.camera.position.
                }
            })
        }
    });

};
var createScene = function(){

    scene = new BABYLON.Scene(engine);
    Player.sphere = BABYLON.Mesh.CreateSphere('sphere1', 12, 2, scene, false, BABYLON.Mesh.FRONTSIDE);
    let sphere = Player.sphere; 

    sphere.position.y = 1;
    
    let newPosition = new BABYLON.Vector3(sphere.position.x, sphere.position.y, sphere.position.z);
    //newPosition.x -= 50;
    newPosition.y -= 3;
    //newPosition.z -= 50;

    Camera.camera = new BABYLON.ArcRotateCamera("camera1", -Math.PI/2, 1.1, 15, new BABYLON.Vector3(0, 0, 0), scene);
    Camera.camera.attachControl(canvas, true);
    createController();

    //camera.attachControl(canvas, false);
    var light = new BABYLON.HemisphericLight('light1', new BABYLON.Vector3(0, 1, 0), scene);
    Tiles.addTile(6,6,null,null);
    
}
// call the createScene function
createScene();
// run the render loop
engine.runRenderLoop(function(){
    scene.render();
});
// the canvas/window resize event handler
window.addEventListener('resize', function(){
    engine.resize();
});
