'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var MyApplication = React.createClass({
	displayName: 'MyApplication',

	componentDidMount: function componentDidMount() {
		window.addEventListener('resize', (function (e) {
			this.forceUpdate();
		}).bind(this));
	},

	render: function render() {
		var layoutType = this._getLayoutType(window.innerWidth, window.innerHeight);

		var buttonSize = 64;
		if (layoutType == 'small') buttonSize = 48;else if (layoutType == 'tiny') buttonSize = 32;

		var buttonProps = {
			width: buttonSize,
			height: buttonSize,
			hoverImage: 'ButtonMask.png',
			hoverImageOpacity: 0.4,
			activeImage: 'ButtonMask3.png',
			activeImageOpacity: 0.5
		};

		//if ( BrowserCapabilities.isMobileDevice() )
		//	buttonProps['hoverable'] = false;

		return React.createElement(
			'div',
			{ style: {
					position: 'absolute',
					left: 0,
					top: 0,
					right: 0,
					bottom: 0,
					overflow: 'hidden'
				} },
			React.createElement('div', { style: {
					position: 'absolute',
					left: 0,
					top: 0,
					right: 0,
					bottom: 0,
					background: 'url(Background.png) no-repeat' },
				onClick: this.onClick

			}),
			React.createElement(
				'div',
				{ style: {
						position: 'absolute',
						left: 0,
						top: 0,
						width: '100%',
						height: '100%',

						display: 'flex',
						flexDirection: 'column'

					} },
				React.createElement(MySlider, { knobImage: 'SliderKnob.png', knobWidth: 32, knobHeight: 32, barWidth: 400, barHeight: 7,
					min: 3,
					max: 13,
					step: 1,
					onKnobDragMove: this._onKnobDragMove,
					onKnobDragEnd: this._onKnobDragEnd }),
				React.createElement(MySlider, { knobWidth: 32, knobHeight: 32, barWidth: 400, barHeight: 7,
					min: 0,
					max: 33,
					step: 0,
					onKnobDragMove: this._onKnobDragMove,
					onKnobDragEnd: this._onKnobDragEnd }),
				React.createElement(MyButton, _extends({ image: 'ToolAddVoxel.png' }, buttonProps, { tooltip: 'Draw new voxels', onClick: this._onAddVoxel })),
				React.createElement(MyButton, _extends({ image: 'ToolClearVoxel.png' }, buttonProps, { tooltip: 'Clear/erase voxels', enabled: false })),
				React.createElement(MyButton, _extends({ image: 'ToolPaintVoxel.png' }, buttonProps, { tooltip: 'Paint on existing voxels' })),
				React.createElement(MyButton, _extends({ image: 'ToolPaintVoxel.png' }, buttonProps, { toggleable: true, onToggled: this._onToggled, onUntoggled: this._onUntoggled })),
				React.createElement(MyButton, _extends({ image: 'ToolPaintVoxel.png' }, buttonProps)),
				React.createElement(MyButton, _extends({ image: 'ToolPaintVoxel.png' }, buttonProps)),
				React.createElement(MyButton, _extends({ image: 'ToolPaintVoxel.png' }, buttonProps))
			)
		);
	},

	/*_onKnobDragStart: function( value )
 {
 	console.log('_onKnobDragStart ' + value);
 },*/

	_onKnobDragMove: function _onKnobDragMove(value) {
		console.log('_onKnobDragMove ' + value);
	},

	_onKnobDragEnd: function _onKnobDragEnd(value) {
		console.log('_onKnobDragEnd ' + value);
	},

	_onAddVoxel: function _onAddVoxel(e) {
		console.log('clicked!');
	},

	_onToggled: function _onToggled() {
		console.log('_onToggled!');
	},

	_onUntoggled: function _onUntoggled() {
		console.log('_onUntoggled!');
	},

	_getLayoutType: function _getLayoutType(width, height) {
		// Express the size in landscape mode, so it can be compared
		// more easily with our template sizes
		var w = width;
		var h = height;
		if (h > w) {
			w = height;
			h = width;
		}

		if (w <= 512 || h <= 360) return 'tiny';else if (w <= 640 || h <= 480) return 'small';

		// We could introduce a 'huge' layout for desktop with full HD or UHD screen!
		return 'normal';
	},

	onClick: function onClick() {
		console.log("CLICK canvas!");
	}
});