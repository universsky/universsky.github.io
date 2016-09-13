// @open license with citation
// @please feel free to reuse this code for any purpose, citing dougx.net
// @see http://dougx.net/plunder/license.txt for MIT open license text



//
// object represents an enemy projectile
//
      function EnemyShot(name, x, y, velX, velY)
      {
         this.myFrameCounter = 0;

         this.myVelX = velX;
         this.myVelY = velY;

         this.myX = x;
         this.myY = y;

         this.myName = name;

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

      EnemyShot.prototype.render = function()
      {
         if ( this.myX + this.myWidth < 0 )
            return false;

         if ( this.myY + this.myHeight < 0 )
            return false;

         if ( this.myY > g_canvas.height )
            return false;

         if ( this.myX > g_canvas.width )
            return false;

         if ( collision(
                  this.myX,                this.myY,
                  this.myX + this.myWidth, this.myY + this.myHeight,
                  g_ship.myX+5,                  g_ship.myY+5,
             g_ship.myX + g_ship.myWidth -5, g_ship.myY + g_ship.myHeight -5 ))
         {
            if ( !g_ship.myDying )
            {
               var ae = new AfterEffect("splode", this.myX, this.myY,
                                        this.myVelX, this.myVelY);
               g_afterEffects.push(ae);
               g_ship.die();
            }
            return false;
         }


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
