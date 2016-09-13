//
// object representing all hero projectiles in the game
//

// @open license with citation
// @please feel free to reuse this code for any purpose, citing dougx.net
// @see http://dougx.net/plunder/license.txt for MIT open license text



      function Shot(weapon, x, y)
      {
         this.myFrameCounter = 0;

         this.myHitPoints = weapon.myHitPoints;
         this.myVelX = weapon.myVelX;
         this.myVelY = weapon.myVelY;

         this.myX = g_ship.myX + g_ship.myWidth + 1;
         this.myY = g_ship.myY + g_ship.myHeight/2 - 1;

         if ( x != undefined )
            this.myX = x;
         if ( y != undefined )
            this.myY = y;

         this.myName = weapon.myName;

         this.myWidth = null;
         this.myHeight = null;
         if ( this.myName == "pea" )
         {
            this.myWidth  = 10;
            this.myHeight = 2;
         }
         else if ( this.myName == "laser" )
         {
            this.myWidth  = 50;
            this.myHeight = 2;
         }
      }

      Shot.prototype.render = function()
      {
         if ( this.myX > g_canvas.width )
            return false;

         if (this.myName == "pea" || this.myName == "laser")
         {
            var color = this.myFrameCounter % g_rainbow.length;
            g_context.fillStyle = g_rainbow[color];

            g_context.fillRect(this.myX, this.myY, this.myWidth, this.myHeight);

            this.myX += this.myVelX;
            this.myY += this.myVelY; 
            this.myFrameCounter++;

            return true;
         }

         return false;
      }
