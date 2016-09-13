//
// this is the object that is dropped when a special ship is destroyed
// can be speed, +shot, laser, gem, doubler, or artifact shard
//

// @open license with citation
// @please feel free to reuse this code for any purpose, citing dougx.net
// @see http://dougx.net/plunder/license.txt for MIT open license text



function Powerup(name,x,y,velx,vely)
{
   this.myName = name;

   this.myImage = document.getElementById(name + "_image");

   if ( name.indexOf("artifact") != -1 )
      this.mySound = g_artifact_chard_sound;
   else
      this.mySound = lookupSound(name + "_sound");

   this.myX = x;
   this.myY = y;
   this.myVelX = velx;
   this.myVelY = vely;

   this.myWidth  = this.myImage.width;
   this.myHeight = this.myImage.height;

   this.myFrameCounter = 0;
}

Powerup.prototype.applyEffect = function()
{
   this.mySound.play();

   var textX = g_ship.myX;
   var textY = g_ship.myY;

   if ( textX < 25 ) textX = 25;
   if ( textY < 25 ) textY = 25;

   if (this.myName == "speed")
   {
      if (g_ship.myVelocity >= 5)
      {
         var f = new FloatyText("+2500", textX, textY);
         g_ship.myScore += 2500;
         g_floatyText.push(f);
         return;
      }

      g_ship.myVelocity++;
      g_ship.myScore += 1000;

      var f = new FloatyText("+SPEED", textX, textY);
      g_floatyText.push(f);
   }
   else if (this.myName == "gun")
   {
      if (g_ship.myWeapon.myName == "laser")
      {
         var f = new FloatyText("+5000", textX, textY);
         g_ship.myScore += 5000;
         g_floatyText.push(f);
         return;
      }

      g_ship.myScore += 2000;
      g_ship.myWeapon = new Laser();

      var f = new FloatyText("+LASER", textX, textY);
      g_floatyText.push(f);
   }
   else if (this.myName == "shot")
   {
      if ( g_ship.myWeapon.myMaxOnScreen >= 5 )
      {
         var f = new FloatyText("+3500", textX, textY);
         g_ship.myScore += 3500;
         g_floatyText.push(f);
         return;
      }

      g_ship.myScore += 1000;
      g_ship.myWeapon.myMaxOnScreen++;

      var f = new FloatyText("+1 SHOT", textX, textY);
      g_floatyText.push(f);
   }
   else if (this.myName == "double")
   {
      if ( g_ship.myWeapon.myDoubled )
      {
         var f = new FloatyText("+5000", textX, textY);
         g_ship.myScore += 5000;
         g_floatyText.push(f);
         return;
      }

      g_ship.myScore += 3000;
      g_ship.myWeapon.myDoubled = true;

      var f = new FloatyText("+DOUBLER", textX, textY);
      g_floatyText.push(f);
   }
   else if (this.myName == "artifact_chard")
   {
      g_ship.myScore += 5000;

      var f = new FloatyText("ALIEN GLYPH +5000", textX, textY);
      g_floatyText.push(f);
   }
   else if (this.myName == "artifact_skull")
   {
      g_ship.myScore += 10000;

      var f = new FloatyText("ALIEN SKULL +10000", textX, textY);
      g_floatyText.push(f);
   }
   else if (this.myName == "gem")
   {
      g_ship.myScore += 2500;

      var f = new FloatyText("+2500", textX, textY);
      g_floatyText.push(f);
   }

}

Powerup.prototype.render = function()
{
   var pullWidth  = g_canvas.width  - this.myX;
   var pullHeight = g_canvas.height - this.myY;

   if ( pullWidth > this.myWidth )
   {
      pullWidth = this.myWidth;
   }
   if ( pullHeight > this.myHeight )
   {
      pullHeight = this.myHeight;
   }

   if ( pullWidth > 0 && pullHeight > 0 )
   {
      g_context.drawImage(this.myImage,
                          0,0, pullWidth, pullHeight,
                          this.myX, this.myY, pullWidth, pullHeight );

      var rColor = this.myFrameCounter % g_rainbow.length;
      g_context.strokeStyle = g_rainbow[rColor];
      g_context.strokeRect(this.myX, this.myY,
                           this.myWidth, this.myHeight);
   }

   this.myX += this.myVelX;
   this.myY += this.myVelY;

   this.myFrameCounter++;

   var retVal = this.collisionOrOffscreen();
   return !retVal;
}

Powerup.prototype.collisionOrOffscreen = function()
{
   if ( collision(
            this.myX,                this.myY,
            this.myX + this.myWidth, this.myY + this.myHeight,
            g_ship.myX,                  g_ship.myY,
            g_ship.myX + g_ship.myWidth, g_ship.myY + g_ship.myHeight ))
   {
      if (!g_ship.myDying)
      {
         this.applyEffect();
         return true;
      }
   }

   if ( this.myX + this.myWidth < 0 )
   {
      return true;
   }

   return false;
}

