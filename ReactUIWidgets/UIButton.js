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

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var UIButton = React.createClass({
	displayName: 'UIButton',

	mixins: [UIDebuggable],

	statics: {
		opacityWhenDisabled: 0.4,
		pixelsShiftWhenActive: 1,

		noEventIdentifier: -1,
		mouseEventIdentifier: -5
	},

	propTypes: {
		enabled: React.PropTypes.bool,
		toggleable: React.PropTypes.bool,

		colorSwatch: React.PropTypes.string,
		image: React.PropTypes.string.isRequired,
		hoverImage: React.PropTypes.string,
		activeImage: React.PropTypes.string,

		title: React.PropTypes.string, // For tooltip

		shiftWhenActive: React.PropTypes.bool,

		onPressed: React.PropTypes.func,
		onReleased: React.PropTypes.func,
		onClick: React.PropTypes.func,
		onToggled: React.PropTypes.func
	},

	getDefaultProps: function getDefaultProps() {
		return {
			enabled: true,
			toggleable: false,

			colorSwatch: null,
			image: null,
			hoverImage: null,
			activeImage: null,

			title: null,

			shiftWhenActive: true,

			onPressed: null,
			onReleased: null,
			onClick: null,
			onToggled: null
		};
	},

	getInitialState: function getInitialState() {
		// The visual state of the button when it's enabled.
		// Being disabled is not a state but a prop
		return {
			hovered: false, // The mouse is hovering above the button
			active: false, // The button is active, it's being pressed (if one-shot button), or it's toggled (if toggle button)						eventIdentifier: UIButton.noEventIdentifier,	// Identify the mouse or touch event being currently processed
			eventIdentifier: UIButton.noEventIdentifier };
	},

	// Identify the mouse or touch event being currently processed
	render: function render() {
		//this._setDebugActive(true);
		this._log("render " + JSON.stringify(this.state));

		// Here you give your widget its default style, typically it's min
		// and possibly max size, depending on the nature of the widget
		var mainDivDefaultStyle = {
			minHeight: 16,
			minWidth: 16
		};

		// Then we override the default style with the user-defined one
		var mainDivStyle = Object.assign(mainDivDefaultStyle, this.props.style);

		// Then we override the position and possibly some other properties...
		mainDivStyle = Object.assign(mainDivStyle, {
			position: 'relative'
		});

		// Images
		var imageStyle = { position: 'absolute', width: '100%', height: '100%' };
		if (!this.props.enabled) {
			imageStyle['filter'] = 'opacity(' + UIButton.opacityWhenDisabled + ')';
			imageStyle['WebkitFilter'] = imageStyle['filter'];
		} else {
			if (this.state.active && this.props.shiftWhenActive) {
				imageStyle['top'] = UIButton.pixelsShiftWhenActive + 'px';
				imageStyle['left'] = UIButton.pixelsShiftWhenActive + 'px';
			}
		}

		var image = null;
		if (this.props.image) image = React.createElement('img', { src: this.props.image, style: imageStyle });

		var hoverImage = null;
		if (this.state.hovered && this.props.hoverImage) // There's most probably an hoverImage otherwise we wouldn't be in the state (maybe unless the state has been set externally by code?)
			hoverImage = React.createElement('img', { src: this.props.hoverImage, style: imageStyle });

		var colorSwatch = null;
		if (this.props.colorSwatch) {
			var hm = 0;
			if (this.props.colorSwatchMargin) hm = this.props.colorSwatchMargin / 2;
			var br = 0;
			if (this.props.colorSwatchBorderRadius) br = this.props.colorSwatchBorderRadius;
			colorSwatch = React.createElement(
				'div',
				{ style: imageStyle },
				React.createElement(
					'div',
					{ style: { position: 'relative', width: '100%', height: '100%' } },
					React.createElement('div', { style: { position: 'absolute', top: hm, bottom: hm, left: hm, right: hm, backgroundColor: this.props.colorSwatch, borderRadius: br } })
				)
			);
		}

		var activeImage = null;
		if (this.state.active && this.props.activeImage) activeImage = React.createElement('img', { src: this.props.activeImage, style: imageStyle });

		var eventHandlers = {};
		if (this.props.enabled) {
			eventHandlers = {
				onMouseDown: this._onMouseDown, // The move and up events are handled at document level
				onTouchStart: this._onTouchStart,
				onTouchEnd: this._onTouchEnd
			};

			if (this.props.hoverImage) {
				eventHandlers["onMouseEnter"] = this._onMouseEnter;
				eventHandlers["onMouseLeave"] = this._onMouseLeave;
			}
		}

		var overlayDiv = React.createElement('div', _extends({ style: imageStyle }, eventHandlers));

		return(
			// The main div of the widget
			React.createElement(
				'div',
				{ style: mainDivStyle, title: this.props.title },
				image,
				colorSwatch,
				hoverImage,
				activeImage,
				overlayDiv,
				React.createElement(
					'div',
					{ style: { position: 'fixed', top: 0, left: 4 } },
					React.createElement('pre', { ref: 'debugDiv' })
				)
			)
		);
	},

	_onMouseEnter: function _onMouseEnter(e) {
		this._log("onMouseEnter");
		e.stopPropagation();
		e.preventDefault();
		this.setState({ hovered: true });
	},

	_onMouseLeave: function _onMouseLeave(e) {
		this._log("_onMouseLeave");
		e.stopPropagation();
		e.preventDefault();
		this.setState({ hovered: false });
	},

	_onMouseDown: function _onMouseDown(e) {
		this._log("_onMouseDown");
		e.stopPropagation();
		e.preventDefault();

		if (this.state.eventIdentifier != UIButton.noEventIdentifier) return; // An event is already being processed

		document.addEventListener('mouseup', this._onMouseUp, true);
		this.setState({ eventIdentifier: UIButton.mouseEventIdentifier });
		var eventParams = this._makeMouseEventParams(e);
		this._onPressed(eventParams);
	},

	_onMouseUp: function _onMouseUp(e) {
		this._log("_onMouseUp");
		e.stopPropagation();
		e.preventDefault();

		if (this.state.eventIdentifier != UIButton.mouseEventIdentifier) return;

		document.addEventListener('mouseup', this._onMouseUp, true);
		this.setState({ eventIdentifier: UIButton.noEventIdentifier });
		var eventParams = this._makeMouseEventParams(e);
		this._onReleased(eventParams);
	},

	_makeMouseEventParams: function _makeMouseEventParams(e) {
		var eventParams = {
			clientX: e.clientX,
			clientY: e.clientY
		};
		return eventParams;
	},

	/*
 	Touch event handles
 */
	_onTouchStart: function _onTouchStart(e) {
		this._log("_onTouchStart id:" + e.changedTouches[0].identifier);
		e.stopPropagation();
		e.preventDefault();

		if (this.state.eventIdentifier != UIButton.noEventIdentifier) return; // An event is already being processed

		var touchIdentifier = e.changedTouches[0].identifier;
		this.setState({ eventIdentifier: touchIdentifier });
		var eventParams = this._makeTouchEventParams(e.changedTouches, touchIdentifier);
		this._onPressed(eventParams);
	},

	_onTouchEnd: function _onTouchEnd(e) {
		this._log("_onTouchEnd id:" + e.changedTouches[0].identifier);
		e.stopPropagation();
		e.preventDefault();

		var eventParams = this._makeTouchEventParams(e.changedTouches, this.state.eventIdentifier);
		if (!eventParams) return; // This touch event doesn't concern the touch we're tracking

		this.setState({ eventIdentifier: UIButton.noEventIdentifier });
		this._onReleased(eventParams);
	},

	_makeTouchEventParams: function _makeTouchEventParams(touchList, identifier) {
		var n = touchList.length;
		for (var i = 0; i < n; ++i) {
			if (touchList[i].identifier == identifier) {
				var eventParams = {
					clientX: touchList[i].clientX,
					clientY: touchList[i].clientY
				};
				return eventParams;
			}
		}
		return null;
	},

	/*
 	Common touch/mouse code
 	This is the one-shot click or toggle logic
 */
	_onPressed: function _onPressed(eventParams) {
		if (this.props.toggleable) {
			this.setState({ active: !this.state.active });
		} else {
			this.setState({ active: true });
		}

		if (this.props.onPressed) this.props.onPressed(eventParams);
	},

	_onReleased: function _onReleased(eventParams) {
		if (this.props.toggleable) {
			var toggled = this.state.active;
			eventParams['toggled'] = toggled;
			if (this.props.onToggled) this.props.onToggled(eventParams);
		} else {
			this.setState({ active: false });
			if (this.props.onClick) this.props.onClick(eventParams);
		}

		if (this.props.onReleased) this.props.onReleased(eventParams);
	}
});