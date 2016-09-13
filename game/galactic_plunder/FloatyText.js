// @open license with citation
// @please feel free to reuse this code for any purpose, citing dougx.net
// @see http://dougx.net/plunder/license.txt for MIT open license text


function FloatyText(text, x, y, duration)
{
   this.myText = text;
   this.myX = x;
   this.myY = y;
   this.myVelX = -1;
   this.myVelY = -1;

   this.myFrameCounter = 0;
   this.myDuration = 36;

   if ( duration != undefined )
      this.myDuration = duration;
}

FloatyText.prototype.render = function()
{
   var textColor = this.myFrameCounter % g_rainbow.length;
   g_context.fillStyle = g_rainbow[textColor];

   g_context.font = "10pt Helvetica";
   g_context.fillText(this.myText, this.myX, this.myY);
   g_context.font = "14pt Helvetica";

   this.myX += this.myVelX;
   this.myY += this.myVelY;
   this.myFrameCounter++;

   if ( this.myFrameCounter > this.myDuration )
      return false;
   return true;
}
