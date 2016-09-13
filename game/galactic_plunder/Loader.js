// @open license with citation
// @please feel free to reuse this code for any purpose, citing dougx.net
// @see http://dougx.net/plunder/license.txt for MIT open license text



//
// Called from the document, as the <body>'s onload event
// also called when the user exits the instructional screen
// in which case the revisit flag is set
//
function bodyLoaded(revisit)
{
   isChr();
   if ( !g_soundsLoaded )
   {
      setTimeout(bodyLoaded, 500);
      return;
   }

   var bg    = document.getElementById("splash_screen");
   var title = document.getElementById("title");
   g_context.drawImage(bg,0,0);
   g_context.drawImage(title,0,0);

   g_context.fillStyle = "yellow";
   g_context.fillText("use arrow keys to move, z to shoot",300,360);
   g_context.fillText("use p key to pause",300,380);

   if ( g_highScore != undefined )
   {
      g_context.fillText("High Score: " + g_highScore, 370, 30);
   }

   // render the two buttons on the main menu and the ctrls checkbox
   g_context.fillStyle = "black";
   g_context.fillRect(400,283,20,20);  //ctrls checkbox

   g_context.fillRect(50,300,150,30);
   g_context.strokeStyle = "gray";
   g_context.strokeRect(50,300,150,30);
   g_context.fillStyle = "gray";
   g_context.fillText("NEW GAME",73,322);

   g_context.fillStyle = "black";
   g_context.fillRect(50,340,150,30);
   g_context.strokeStyle = "gray";
   g_context.strokeRect(50,340,150,30);
   g_context.fillStyle = "gray";
   g_context.fillText("INSTRUCTIONS",52,361);

   g_context.strokeRect(400,283,20,20);
   g_context.fillText("Onscreen Controls",425,300);
   if ( g_onscreenControls )
   {
      g_context.strokeStyle = "gray";
      g_context.beginPath();
      g_context.moveTo(400,283);
      g_context.lineTo(420,303);
      g_context.stroke();
      g_context.beginPath();
      g_context.moveTo(420,283);
      g_context.lineTo(400,303);
      g_context.stroke();
   }

   g_gameState = "splash";

   if ( g_dinkSound == null )
      g_dinkSound = new Sound("dink",4);

   if ( revisit == undefined )
   {
      g_canvas.addEventListener('mousemove', ev_mousemove, false);
      g_canvas.addEventListener('mousedown', ev_mousedown, false);
   }
}

//
// called by the document as it loads, individual items in the <body>
// ask for this to be called as they load.  note that <audio> does not
// support the onload event so the load screen will be frozen while
// audio items load.  images will update the load screen just fine
//
function itemLoaded(item)
{
   if (g_context == undefined)
   {
      if ( !initCanvas() )
      {
         dbg("Critical error initializing canvas.", false);
         return;
      }
   }

   if (item.id == "splash_screen")
   {
      g_context.drawImage(item,0,0);
      g_context.strokeRect(35,220, 500,40);
   }
   else if (item.id == "loading")
   {
      g_context.drawImage(item,0,0);
      g_context.fillStyle = "black";
      g_context.fillRect(400,300, 300,30);
      g_context.fillStyle = "green";
      g_context.fillText("Loading game sounds", 400,320);
      g_soundsLoaded= false;
      loadGameSounds();
   }

   g_itemsLoaded++;

   g_context.fillStyle = "black";
   g_context.fillRect(400,300, 300,30);
   g_context.fillStyle = "green";
   g_context.fillText(item.id, 400,320);

   var percent = g_itemsLoaded / g_totalItems;
   var width = Math.floor(percent * 500);
   g_context.fillRect(35,220, width,40);
}



//
// Called the first time loadItem is invoked while the body is loading
//
function initCanvas()
{
      g_canvas = document.getElementById('theCanvas');

      if (!g_canvas.getContext)
      {
         return false;
      }

      g_context = g_canvas.getContext('2d');
      g_context.font = "14pt Helvetica";
      g_context.lineWidth = 2;
      g_context.strokeStyle = "green";

      g_totalItems  = 46;
      g_itemsLoaded = 0;

      g_onscreenControls = false;
 
      return true;
}
