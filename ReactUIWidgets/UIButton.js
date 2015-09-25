'use strict';

/*
	UIButton

	An image-based button widget.
	
	A button can be:
	- disabled (enabled=false) in which case it appears greyed/washed out (via opacity). 
	  no interaction is possible with it
	- enabled (enabled=true). Additional (and combinable) "sub"-states are:
		- hovered: when the mouse is just above it
		- active: when the user is pressing it 

	Visually the button is made up of 3 images on top of each other:
	- the main image (props.image)
	- the hover image (props.hoverImage)
	- the active image (props.activeImage)

	There two types of buttons:
	- one-shot (toggleable=false)
	- toggle (toggleable=true)
	
	In terms of generated events:
	- one-shot button: onPressed, then later onClick + onReleased
	- toggle button: 
		onPressed, then later onToggled(true) + onReleased
		onPressed, then later onToggled(false) + onReleased

	Use props.title to set a tooltip to the button.
*/

var UIButton = React.createClass
( 
	{displayName: "UIButton",
		mixins: [UIDebuggable],

		statics:
		{
			opacityWhenDisabled:0.4,
			pixelsShiftWhenActive:1,
		},

		propTypes:
		{
			enabled: React.PropTypes.bool,
			toggleable: React.PropTypes.bool,

			image: React.PropTypes.string.isRequired,
			hoverImage: React.PropTypes.string,
			activeImage: React.PropTypes.string,

			title: React.PropTypes.string, 			// For tooltip

			shiftWhenActive: React.PropTypes.bool,

			onPressed: React.PropTypes.func,
			onReleased: React.PropTypes.func,
			onClick: React.PropTypes.func,
			onToggled: React.PropTypes.func,
		},

		getDefaultProps: function()
		{
			return { 
				enabled: true,
				toggleable: false,
				
				image: null,
				hoverImage: null,
				activeImage: null,

				title:null,

				shiftWhenActive: true,

				onPressed:null,
				onReleased:null,
				onClick:null,
				onToggled:null,
			};
		},

		getInitialState: function()
		{
			// The visual state of the button when it's enabled.
			// Being disabled is not a state but a prop
			return {
						hovered: false,	// The mouse is hovering above the button
						active: false,	// The button is active, it's being pressed (if one-shot button), or it's toggled (if toggle button)
						eventIdentifier: -1,	// Identify the mouse (1) or touch (touch.identifier) event being currently processed
					};	
		},
		

		render: function()
		{
			//this._setDebugActive(true);
			this._log( "render " + JSON.stringify( this.state ) );

			// Here you give your widget its default style, typically it's min 
			// and possibly max size, depending on the nature of the widget
			var mainDivDefaultStyle = {
				minHeight:16,
				minWidth:16,
			};

			// Then we override the default style with the user-defined one
			var mainDivStyle = Object.assign( mainDivDefaultStyle, this.props.style);
			
			// Then we override the position and possibly some other properties...
			mainDivStyle = Object.assign( mainDivStyle, 
								{
									position:'relative',
								} );

			// Images
			var imageStyle = {position:'absolute', width:'100%', height:'100%'};
			if ( !this.props.enabled )
			{
				imageStyle['filter'] ='opacity(' + UIButton.opacityWhenDisabled + ')';
				imageStyle['WebkitFilter'] = imageStyle['filter'];
			}
			else
			{
				if ( this.state.active && this.props.shiftWhenActive )
				{
					imageStyle['top'] = UIButton.pixelsShiftWhenActive + 'px';
					imageStyle['left'] = UIButton.pixelsShiftWhenActive + 'px';
				}
			}

			var image = React.createElement("img", {src: this.props.image, style: imageStyle});
			
			var hoverImage = null;
			if ( this.state.hovered )
				hoverImage = React.createElement("img", {src: this.props.hoverImage, style: imageStyle});

			var activeImage = null;
			if ( this.state.active )
				activeImage = React.createElement("img", {src: this.props.activeImage, style: imageStyle});
	
			var eventHandlers = {};
			if ( this.props.enabled )
			{
				eventHandlers = {
					onMouseEnter: this._onMouseEnter,
					onMouseLeave: this._onMouseLeave,
					onMouseDown: this._onMouseDown,	// The move and up events are handled at document level 
					onTouchStart: this._onTouchStart,
					onTouchEnd: this._onTouchEnd,
				};
			}

			var overlayDiv = React.createElement("div", React.__spread({style: imageStyle},  eventHandlers));

			return (
				// The main div of the widget
				React.createElement("div", {style: mainDivStyle, title: this.props.title}, 

					image, 
					hoverImage, 
					activeImage, 
					overlayDiv, 

					React.createElement("div", {style: {position:'fixed', top:0, left:4}}, 
						React.createElement("pre", {ref: "debugDiv"}
						)
					)
				)
			);
		},

		_onMouseEnter: function( e )
		{
			this._log("onMouseEnter");
			//e.stopPropagation();
			e.preventDefault();		
			this.setState( {hovered:true} );
		},

		_onMouseLeave: function( e )
		{
			this._log("_onMouseLeave");
			//e.stopPropagation(); 
			e.preventDefault();		
			this.setState( {hovered:false} );
		},

		_onMouseDown: function( e )
		{
			this._log("_onMouseDown");
			//e.stopPropagation();
			e.preventDefault();	

			if ( this.state.eventIdentifier!=-1 )	
				return;	// An event is already being processed

			document.addEventListener('mouseup', this._onMouseUp, true);
			this.setState( {eventIdentifier:1} );
			this._onPressed();
		},

		_onMouseUp: function( e )
		{
			this._log("_onMouseUp");
			//e.stopPropagation();
			e.preventDefault();
			document.addEventListener('mouseup', this._onMouseUp, true);
			this.setState( {eventIdentifier:-1} );
			this._onReleased();
		},

		/*
			Touch event handles
		*/
		_onTouchStart: function(e)
		{
			this._log("_onTouchStart id:" + e.changedTouches[0].identifier );			
			//e.stopPropagation();
			e.preventDefault();		

			if ( this.state.eventIdentifier!=-1 )	
				return;		// An event is already being processed

			var touchIdentifier = e.changedTouches[0].identifier;
			this.setState( {eventIdentifier:touchIdentifier} );
			this._onPressed();
		},

		_onTouchEnd: function(e)
		{
			this._log("_onTouchEnd id:" + e.changedTouches[0].identifier );
			//e.stopPropagation();
			e.preventDefault();
			 
			if ( !this._touchListContainsIdentifier( e.changedTouches, this.state.eventIdentifier ) )
				return;
			
			this.setState( {eventIdentifier:-1} );
			this._onReleased();
		},

		_touchListContainsIdentifier: function( touchList, identifier )
		{
			var n = touchList.length;
			for ( var i=0; i<n; ++i )
			{
				if ( touchList[i].identifier==identifier )
					return true;
			}
			return false;
		},

		/*
			Common touch/mouse code
			This is the one-shot click or toggle logic
		*/
		_onPressed: function()
		{
			if ( this.props.toggleable )
			{
				this.setState( {active:!this.state.active} );
			}
			else
			{
				this.setState( {active:true} );
			}

			if ( this.props.onPressed )
				this.props.onPressed();
		},

		_onReleased: function()
		{
			if ( this.props.toggleable )
			{
				var toggled = this.state.active;
				if ( this.props.onToggled )
					this.props.onToggled( toggled );
			}
			else
			{
				this.setState( {active:false} );
				if ( this.props.onClick )
					this.props.onClick();
			}

			if ( this.props.onReleased )
				this.props.onReleased();
		},
	}
);

