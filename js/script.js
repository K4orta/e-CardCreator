/* Author:
	Erik Wong
*/

var CardApp = Class.extend({
  container:null,
  mouseX:0,
  mouseY:0,
  maxXRot:25,
  maxYRot:45,
  enable3D:true,
  activeSelection:null,
  toolbar:[],
  toolbarStart:{x:60,y:0},
  menus:[],
  init: function(target){
    var that = this;
    this.container = target;
    $('body').css('-webkit-perspective' ,1500); 
    $(window).mousemove(function(event){
      that.mouseHandler(event);
    });
    this.container.css('border', '1px solid #777');
    this.container.find('.innerCard').css('-webkit-transform', 'translateZ(10px)').click(function(){
      that.clearSelection.apply(that);
    });
    //UI and toolbars

    setInterval(function(){that.update()}, 1000/30);
    this.addToolButton(new CardUIButton(this, 'calculator', new MenuTip(this,"Premade Cards")));
    this.addToolButton(new ImageUIButton(this));
    var nc;
    this.addToolButton(new CardUIButton(this, 'comment', new MenuTip(this,"Add Text"))).button.click(function(){
      new EditableText(that);
    });
    this.addToolButton(new CardUIButton(this, 'mail-closed', new MenuTip(this, "Share")));

    new TextToolBar(this);

    $(document).keydown(function(event){
      return that.handleKeys.apply(that, [event]);
    });
    $(window).resize(function(){
      $('.cardMenuUI').each(function(){
        $(this).css('left',$(window).width()-$(this).width());
      });
    });

    //tn.toJSON();
  },
  update: function(){
    if(this.enable3D){
      $('.cardHolder').css('-webkit-transform', 'rotateY('+ this.maxXRot*this.mouseDistFromCenter()/600 +'deg)');
      //changes the z-depth to make sure that hit detection doesn't break in 3D mode
      $('h1').css('-webkit-transform', 'translateZ(100px)');
    }
  },
  registerMenu: function(MenuAR){
    this.menus.push(MenuAR);
  },
  handleKeys:function(event){
    if(event.keyCode == 8){
      //event.preventDefault();
      if(this.activeSelection!=null){
        this.activeSelection.kill();
        return false;
      }
    }
    return true;
  },
  addToolButton: function(Btn){
    this.toolbar.push(Btn);
    var nButton = this.toolbar[this.toolbar.length-1].button;
    // These are sort of hacky, refactor so that they don't look strange in 2D fallback
    nButton.css({position:'absolute',
      left:this.toolbarStart.x + this.container.offset().left + (this.container.width()*.5), 
      top:this.toolbarStart.y+(this.toolbar.length-1) * (32+8),
    });
    return Btn;
  },
  clearSelection: function(){
    this.activeSelection = null;
    //console.log(this);
    $('.propBar').fadeOut();
    this.container.find('.activeSelection').removeClass('activeSelection');
  },
  mouseHandler: function(event){
    this.mouseX = event.pageX;
    this.mouseY = event.pageY;
  },
  mouseDistFromCenter: function(){
    return this.mouseX - (this.container.offset().left + this.container.width() /2);
  },
  clickedChild:function(child){
    if(child.textColor!=undefined){
      this.activeSelection = child;
      $('.propBar').fadeIn();
      child.target.find('h1').addClass('activeSelection');
    }
  },
  closeOpenMenu:function(OpenOnClose){
    //close current menu
    var cm;
    var foundOpen = false;
    for (var i=0;i<this.menus.length; ++i) {
      cm=this.menus[i];
      if(cm.isOpen&&cm!=OpenOnClose){
        foundOpen = true;
          cm.close.apply(cm);
          OpenOnClose.open.apply(OpenOnClose);
        }
      
    }
    if(!foundOpen){
      OpenOnClose.open.apply(OpenOnClose);
    }
  }
});

// Draggle Element is an abstract class
var DraggableElement = Class.extend({
  x:0,
  y:0,
  dragging:false,
  target:null,
  parent:null,
  cardStage:null,
  init:function(Parent){
    var that = this;
    this.parent = Parent;
    this.cardStage = Parent.container.find('.innerCard');
    this.target = this.cardStage.append('<div class="draggable"></div>')
      .children('.draggable')
      .last();
    this.target.draggable({start:function(){
      that.startDrag.apply(that);
    }, stop:function(){
      that.endDrag.apply(that);
    }});
    this.target.mouseup(function(){
      that.mouseUp.apply(that);
    });
  },
  update:function(){
  
  },
  startDrag:function(){
    this.dragging = true;
    this.parent.clearSelection.apply(this.parent);
  },
  endDrag:function(){
    this.x=this.target.offset().left-this.target.parent().offset().left;
    this.y=this.target.offset().top-this.target.parent().offset().top;
  },
  clickOnly: function(){

  },
  mouseUp:function(){
    this.parent.clickedChild(this);
    if(this.dragging){
      this.dragging=false;
    }else{
      this.dragging=false;
      this.clickOnly.apply(this);
    }
  }, // returns a JSON string that can be used to create a new version of this draggable 
  toJSON:function(){
    var propName;
    for(propName in this){
      if(typeof this[propName] !== 'function'&&typeof this[propName] !=='object'){

          console.log(propName+ ' : ' + this[propName]);
      }
    }
    return "";
  },
  loadFromJSON:function(JSONStr){

  },
  save:function(){
    return {this.x,this.y};
  },
  kill:function(){
    this.target.remove();
  }
});
// important data to get out: x,y,font,fancy,text,size in px
var EditableText = DraggableElement.extend({
  curText:"",
  editing:false,
  textSize:3,
  lineHeight:1.5,
  textColor:0,
  init:function(Parent, StartText){
      this.curText = StartText || "Enter Text";
      this._super(Parent);
      this.target.append('<h1 class="fancyTitle inactiveSelection">'+this.curText+'</h1>');
      this.target.find('h1').css({position:'absolute','margin':4});
      this.target.find('.fancyTitle').css('font-size', this.textSize+'em');
  },
  clickOnly:function(){
    //Start editing
    if(!this.editing){

      this.editing = true;
      var that = this;
      this.target.keyup(function(){
        that.checkResize.apply(that);
      });
      //WARNING: HACK TO STOP FLICKERING ON NEWLINE
      var that = this;
      this.target.keypress(function(){
        var inputTarget =  that.target.find('textarea');
        var nt = that.target.find('h1');
        inputTarget.width(inputTarget.width()+16).scrollTop(0);
      });
      var nt = this.target.find('h1');
      nt.hide();
      //nt.css('margin-left',4);
      // Add the text area
      this.target.append('<textarea>'+this.curText.replace(/<br>/g, "\n") +'</textarea>');
      var inputTarget =  this.target.find('textarea');
      if(nt.hasClass('fancyTitle')){
        inputTarget.addClass('fancyTitle');
      }
      //console.log(nt.css('font-size'));
     inputTarget.css({'padding-top': parseInt(nt.css('font-size').replace(/px/,''))*.15});
      // Unused selection hook for text color changing
      inputTarget.select(function(dat){
        //var tn = that.getSelectedText();
        //console.log(tn.getRangeAt(0));
      }); 
      inputTarget.focus()
        .css({'font-size':nt.css('font-size'),'font-family':nt.css('font-family')})
        .width(nt.width())
        .height(nt.height());
      inputTarget.blur(function(){
        that.curText = that.target.find('textarea').val().replace(/\n/g, "<br>");
        inputTarget.remove();
        that.target.find('h1').html(that.curText).show();
        // Unbind above hack
        that.target.unbind('keypress');
        that.target.unbind('keyup');
        that.editing=false;
        that.target.find('h1').addClass('activeSelection');
        that.parent.activeSelection = that;
      });
    }
  },
  getSelectedText:function(){
    if(window.getSelection) {
      return window.getSelection(); 
    }else if(document.getSelection) { 
      return document.getSelection(); 
    } else {
       var selection = document.selection && document.selection.createRange();
       if(selection.text) { return selection.text; }
          return false;
    }
    return false;
  },
  checkResize:function(){
    var inputTarget =  this.target.find('textarea');
    var nt = this.target.find('h1');
    this.curText = inputTarget.val().replace(/\n/g, "<br>");
    nt.html(this.curText);
    inputTarget.animate(nt.width);
    //inputTarget.width(nt.width()+16*this.textSize).height(nt.height()).scrollTop(0);
    inputTarget.animate({width:nt.width()+16*this.textSize, height:nt.height()},{duration:100});
    
  },
  loadFromJSON:function(){
    this._super();

  },
  save:function(){
    return "";
  }
});

//VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV
//  Toolbar buttons
//__________________________________________________

var CardUIButton = Class.extend({
  parent:null,
  button:null,
  animating:false,
  menu:null,
  init:function(Parent, Icon, Menu){
    var that = this;
    this.parent = Parent;
    this.parent.container.append('<div class="toolbarBtn"><span style="position:absolute;top:8px;left:8px" class="ui-button-icon-primary ui-icon ui-icon-'+Icon+'"></span>&nbsp;</div>');
    this.button = this.parent.container.find('.toolbarBtn')
      .last();
    this.button.css('-webkit-transform','translateZ(100px)');
    //Menu = Menu || null;
    if(Menu!=undefined){
      this.addMenu(Menu);
    }

    this.button.click(function(){
      that.clickedBtn.apply(that);
    });
    this.button.mouseenter(function(){
      that.hoverBtn.apply(that);
    });
    this.button.mouseleave(function(){
      that.mouseOutBtn.apply(that);
    });
  },
  clickedBtn:function(){
    //console.log(this.menu);
  },
  hoverBtn:function(){
    if(!this.animating){
      var that=this;
      var curX = this.button.css('left').replace(/px/,'');
      //console.log(curX);
      this.animating=true;
      this.button.css('left',curX-6);
      this.button.animate({left:curX},{duration:200,queue:false,complete:function(){
        that.animating = false;
      }});
    }

    if(!this.menu.isOpen&&!this.menu.animating){
      this.parent.closeOpenMenu(this.menu);
      //this.menu.open();
    }
  },
  mouseOutBtn:function(){
    
  },
  addMenu:function(MenuOb){
    this.menu = MenuOb;
    this.parent.registerMenu(this.menu);
  },
});

var ImageUIButton = CardUIButton.extend({
  init:function(Parent){
    this._super(Parent, 'image');
    //this.menu = 
    //this.parent.registerMenu(this.menu);
    this.addMenu(new BackgroundMenu(Parent));
  }
});
//VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV
//  SIDE BAR
//__________________________________________________

var UISidebar = Class.extend({
  onMenuClose:null,
  parent:null,
  isOpen:false,
  animating:false,
  $menu:null,
  title:"",
  init:function(Parent){
    this.parent = Parent;
    this.$menu = $('.mainAppContainer').append('<div class="cardMenuUI clearfix"></div>').find('.cardMenuUI').last();
    this.$menu.width(60).height(400);
    this.$menu.prepend('<h2>'+this.title+'</h2>');
  },
  open:function(){
    var that = this;
    this.animating=true;
    that.isOpen=true;
    this.$menu.show({effect:'slide', direction:'right', duration:100, complete:function(){
      that.animating=false;
    }});
  },
  close:function(){
    var that = this;
    this.$menu.hide({effect:'slide', direction:'right', duration:100, complete:function(){
      that.animating=false;
      that.isOpen=false;
    }});
    this.animating=true;
    this.isOpen= false;
  },
  closeDone:function(){

  }
});

var MenuTip = UISidebar.extend({
  init:function(Parent, TText){
    this.title = TText;
    this._super(Parent);
    this.$menu.width(200).height(42);
    this.$menu.css({top:10,left:$(window).width()-this.$menu.width()-20});
    this.$menu.hide();
    //this.$menu.prepend('<h2>'+this.title+'</h2>');

  }
});

var ShareMenu = UISidebar.extend({
  init:function(){
    this.super();
  }
});

var BackgroundMenu = UISidebar.extend({
  init:function(Parent){
    this.title = "Backgrounds";
    this._super(Parent);
    this.$menu.width(200).height(400);
    this.$menu.css({top:10,left:$(window).width()-this.$menu.width()});
    this.$menu.append('<div class="gamePanel"></div>');
    this.$menu.hide();
    var that = this;
    // TODO Refactor this into smaller chunks
    $.get('gamelist.html', function(data){
      var $gamePanel = that.$menu.find('.gamePanel');
      $gamePanel.append(data);
      var $gameHead;
      $gamePanel.find('ul').each(function(){
        //set up game headers
        $(this).wrap('<div class="ulWrap clearfix">');
        $gameHead = $('<div class="gameBackgroundHeader"><span> + '+$(this).attr('gameName')+'</span></div>').insertBefore($(this));
        $(this).parent().height('24px');
        $(this).parent().mouseenter(function(){
          if(!$(this).is(':animated')){
            $(this).animate({height:$(this).find('li').length*86+24,queue:false});
          }
        });
        $(this).parent().mouseleave(function(){
            $(this).animate({height:24,queue:false});
        });

      });
      //Click on Thumbnail
      $gamePanel.find('li').each(function(){
        $(this).click(function(){
          var bgUrl = $(this).find('img').attr('src').split('/');
          that.parent.container.find('.innerCard').css('background-image','url(images/backgrounds/'+bgUrl[bgUrl.length-1]+')');
        });
      });
      
    });
  }
});

var TextToolBar = Class.extend({
  $toolbar:null,
  parent:null,
  init:function(Parent){
    this.parent = Parent;
    var that = this;

    this.$toolbar = $('<div class="propBar"></div>').prependTo(this.parent.container);
    $('.propBar').fadeOut();
    this.$toolbar.css({'-webkit-transform':'translateZ(-20px)', float:'left', position:'absolute', left:-(this.$toolbar.width()+24)});
    
    $(this.$toolbar).append('Text Size:');
    $('<button class="">-</button>').appendTo(this.$toolbar).css({'-webkit-transform':'translateZ(20px)'}).click(function(){
      if(that.parent.activeSelection!=null){
        var $textEl = that.parent.activeSelection.target.find('h1');
        $textEl.animate({'font-size':(parseInt($textEl.css('font-size').replace(/px/i,''))-4)+'px'},{duration:120,queue:true});
      }
    });
    $('<button class="">+</button>').appendTo(this.$toolbar).css({'-webkit-transform':'translateZ(20px)'}).click(function(){
      if(that.parent.activeSelection!=null){
        var $textEl = that.parent.activeSelection.target.find('h1');
        //$textEl.css('font-size', );
        $textEl.animate({'font-size':(parseInt($textEl.css('font-size').replace(/px/i,''))+4)+'px'},{duration:120,queue:true});
      }
    });
    $(this.$toolbar).append('Font:');
    $('<select><option value="GillSans, Calibri, Trebuchet, sans-serif">GillSans</option><option value="Impact, Haettenschweiler, Arial Narrow Bold, sans-serif">Impact</option><option value="Palatino, Palatino Linotype, Georgia, Times, Times New Roman, serif">Palatino  </option></select>').appendTo(this.$toolbar).css({'-webkit-transform':'translateZ(20px)'}).change(function(){
       if(that.parent.activeSelection!=null){
          var $textEl = that.parent.activeSelection.target.find('h1');
          $textEl.css('font-family', $(this).val());
        }
    });
    $(this.$toolbar).append('Fancy Text:');
    $('<input type="checkbox" checked="checked">').appendTo(this.$toolbar).css({'-webkit-transform':'translateZ(20px)'}).change(function(){
      if($(this).prop("checked")){
        that.parent.activeSelection.target.find('h1').addClass('fancyTitle');
      }else{
        that.parent.activeSelection.target.find('h1').removeClass('fancyTitle');
      }
    });

  }
});

//Run the porogram

(function(){
  curCard = new CardApp($('.cardHolder'));
})();