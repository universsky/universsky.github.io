// @open license with citation
// @please feel free to reuse this code for any purpose, citing dougx.net
// @see http://dougx.net/plunder/license.txt for MIT open license text
// ---helpful modifications to this code?
// ---please email your improvements to contact@dougx.net
// ---thank you!

function Sound(name, multi)
{
   if ( g_soundDataMap[name] == undefined )
   {
      dbg("Can't instantiate sound called: " + name, false);
      return;
   }

   if ( multi == undefined || multi < 2 || multi == null)
   {
      dbg("Bad instance number request " + name, false);
      multi = 2;
   }

   this.myName = name;
   this.myInstanceArray = new Array();
   this.myNumInstances = multi;
   this.myLastInstancePlayed = null;
   this.myInstanceIndex = 0;

   for ( var i = 0; i < this.myNumInstances; ++i )
   {
      this.myInstanceArray[i] = new Audio();
      this.myInstanceArray[i].src = g_soundDataMap[name];  // base64 encoded ogg
      this.myInstanceArray[i].load();
   }
}

//
// Sound member functions
//
Sound.prototype.play = function()
{
   if ( g_isChr)
   {
      this.playChr();
      return;
   }

   this.myInstanceArray[this.myInstanceIndex].play();

   this.myInstanceIndex++;
   if ( this.myInstanceIndex >= this.myNumInstances)
   {
      this.myInstanceIndex = 0;
   }
}

//
// webkit has trouble with very short sound effects (replaying them correctly)
// so we have to re-load each instance after it plays. Chrome will also do
// a hit to the internet if the resource for the sound is a url to an ogg file
// which is why I keep the sound data as base64 encoded text stored in 
// javascript variables.
//
Sound.prototype.playChr= function()
{
   var played = false;
   var loaded = false;

   for ( var i = 0; i < this.myNumInstances; ++i)
   {
 
      if ( this.myInstanceArray[i].readyState != 4)
         continue;

      if (( this.myInstanceArray[i].ended == false ) &&
          ( this.myInstanceArray[i].currentTime == 0 ))
      {
         if ( !played )
         {
            //dbg(this.myName + " playing instance " + i + "<br>", true);
            this.myInstanceArray[i].play();
            this.myLastInstancePlayed = i;
            played = true;
         }
      }
   }

   for ( var i = this.myLastInstancePlayed;  i >= 0; --i)
   {
      if ( this.myInstanceArray[i].ended == true )
      {
         if ( !loaded )
         {
            this.myInstanceArray[i].load();
            loaded = true;
         }
      }
   }

   if (!loaded)
   {
      for ( var i = this.myNumInstances-1;  i > this.myLastInstancePlayed; --i)
      {
         if ( this.myInstanceArray[i].ended == true )
         {
            if ( !loaded )
            {
               this.myInstanceArray[i].load();
               loaded = true;
            }
         }
      }
   }

/*
         dbg(this.myName + "[" + i + "]" + " ended=" +
             this.myInstanceArray[i].ended + ". current time = " +
             this.myInstanceArray[i].currentTime + "<br>", true);


   if ( !played )
   {
      dbg(this.myName + " no instance played<br>", true);
      if ( !loaded )
         dbg(this.myName + " no instance loaded<br>", true);
   }
*/
}

function isChr()
{
    // dbg(navigator.userAgent, false);

   if (navigator.userAgent.indexOf('AppleWebKit') != -1)
      g_isChr= true;
   else
      g_isChr= false;
}
