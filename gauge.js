(function() {
	
	var rad = Math.PI / 180;

	function extend(obja, objb) {
		for(var p in objb){
			if ( p in obja)
				continue;
			obja[p] = objb[p];
		}
		
		return obja;
	}
	
	function calcPointOnCircle(cx, cy, r, angle) {
		var x = cx + r * Math.cos(angle * rad);
		var y = cy + r * Math.sin(angle * rad)
		return {
			x: x,
			y: y
		};
	}

	function drawDoubleSector(canvas, cx, cy, r, r2, startAngle, endAngle, params) {
		var x1 = cx + r * Math.cos(-startAngle * rad),
			x2 = cx + r * Math.cos(-endAngle * rad),
			y1 = cy + r * Math.sin(-startAngle * rad),
			y2 = cy + r * Math.sin(-endAngle * rad);

		var p1 = calcPointOnCircle(cx, cy, r2, -startAngle);
		var p2 = calcPointOnCircle(cx, cy, r2, -endAngle);


		var path = canvas.path([
			"M", x2, y2,
			"A", r, r, 0, +(endAngle - startAngle > 180), 1, x1, y1,
			'L', p1.x, p1.y,
			"A", r2, r2, 0, +(endAngle - startAngle > 180), 0, p2.x, p2.y,
			"z"
		]);

		return path.attr(params);
	}

	function Gauge(options) {
		this.options = extend(options, Gauge.defaultOptons);
		this.container = options.container;
		
		var startAngle = this.options.startAngle;
		var endAngle = this.options.endAngle;
		
		this.unit = this.options.unit || '';
		this.title = this.options.title || '';
		this.maxValue = this.options.maxValue;
		this.minValue = this.options.minValue;
		this.value = this.options.value;
		
		this.cx = this.options.width / 2;
		this.cy = this.options.height / 2;
		
		var values = this.maxValue - this.minValue;
		var angles = Math.abs(startAngle) + Math.abs(endAngle);
		
		this.valuesPerAngle = values / angles;
		
		if (options.greenTo != undefined) {
			this.greenAngleFrom = endAngle - options.greenTo / this.valuesPerAngle;
			this.greenAngleTo = endAngle - options.greenFrom / this.valuesPerAngle;	
		}
		
		if (options.yelloTo != undefined){
			this.yelloAngleFrom = endAngle - options.yelloTo / this.valuesPerAngle;
			this.yelloAngleTo = endAngle - options.yellowFrom / this.valuesPerAngle;	
		}
		
		if (options.redTo != undefined){
			this.redAngleFrom = endAngle - options.redTo / this.valuesPerAngle;
			this.redAngleTo = endAngle - options.redFrom / this.valuesPerAngle;	
		}
	}

	Gauge.prototype = {
		draw: function() {
			var opts = this.options,
				paper = Raphael(this.container, opts.width, opts.height);
				startAngle = opts.startAngle,
				endAngle = opts.endAngle,
				radius1 = opts.radius,
				radius2 = radius1 - 16,
				radius3 = radius2 - 15,
				cx = this.cx,
				cy = this.cy,
				maxValue = this.maxValue,
				minValue = this.minValue;
			
			drawDoubleSector(paper, cx, cy, radius1, radius2, startAngle, endAngle, {
				'stroke': 'none',
				'fill': '#eee'
			});
			
			// green
			if (this.greenAngleFrom != undefined) {
				drawDoubleSector(paper, cx, cy, radius1, radius2, this.greenAngleFrom, this.greenAngleTo, {
					'stroke': 'none',
					'fill': '#5bb85d'
				});
			}
			
			// yello
			if (this.yelloAngleFrom != undefined) {
				drawDoubleSector(paper, cx, cy, radius1, radius2, this.yelloAngleFrom, this.yelloAngleTo, {
					'stroke': 'none',
					'fill': '#fba236'
				});
			}
			
			// red
			if (this.redAngleFrom != undefined) {
				drawDoubleSector(paper, cx, cy, radius1, radius2, this.redAngleFrom, this.redAngleTo, {
					'stroke': 'none',
					'fill': '#fe563d'
				});
			}
			
			drawDoubleSector(paper, cx, cy, radius3 + 1, radius3, startAngle, endAngle, {
				'stroke': 'none',
				'fill': '#fa8731'
			})

			// 大刻度线
			var angle = (endAngle - (startAngle)) / 4;
			var val = (maxValue - minValue) / 4;
			for (var i = 0; i <= 4; i++) {
				var p1 = calcPointOnCircle(cx, cy, radius1 - 1, -(startAngle + angle * i));
				var p2 = calcPointOnCircle(cx, cy, radius2 + 6, -(startAngle + angle * i));
				paper.path(['M', p2.x, p2.y, 'L', p1.x, p1.y]).attr({
					'stroke': '#444'
				});

				var p3 = calcPointOnCircle(cx, cy, radius3 + 10, -(startAngle + angle * i));

				var sin_a = Math.abs(cy - p3.y) / Math.sqrt(Math.pow(Math.abs(cx - p3.x), 2) + Math.pow(Math.abs(cy - p3.y), 2));
				var angel_a = Math.asin(sin_a) / rad;
				if (angel_a == 90)
					angel_a = 0;
				else {
					angel_a = p3.y > cy ? angel_a + 90 : angel_a;
					angel_a = p3.x > cx ? angel_a : -angel_a;
				}
				paper.text(p3.x, p3.y, maxValue - i * val)
					.attr({
						'fill': '#666',
						'font-size': '9'
					})
					.transform('R' + angel_a);
				//paper.text(p3.x, p3.y, maxValue - i * val).transform('R' + (cx < p3.x ? (90 - angel_a) : (-angel_a - 90)) );
			}

			// 小刻度线
			angle = (endAngle - (startAngle)) / (4 * 5);
			for (var i = 0; i <= 4 * 5; i++) {
				if (i % 5 == 0)
					continue;
				var p1 = calcPointOnCircle(cx, cy, radius1 - 1, -(startAngle + angle * i));
				var p2 = calcPointOnCircle(cx, cy, radius2 + 12, -(startAngle + angle * i));
				paper.path(['M', p2.x, p2.y, 'L', p1.x, p1.y]).attr({
					'stroke': '#666'
				});
			}


			paper.text(cx, cy - 15, this.unit).attr('fill', '#666');
			paper.text(cx, cy + 20, this.value).attr('fill', '#666');
			paper.text(cx, cy + 40, this.title)
				.attr({'fill': '#333', 'font-size': 12, 'cursor': 'pointer'})
				.mouseover(function(){
					 this.attr({'fill': 'red'});
				})
				.mouseout(function(){ 
					this.attr({'fill': '#333'});
				})
				.click(function() {
					if (opts.onclick) {
						opts.onclick(this.options);
					}
				});

			// 指针
			var indicator = paper.rect(cx - 10, cy - 0.5, radius2 + 5, 1, 1).attr({
				'fill': '#4684ee',
				'stroke': 'none'
			});
			var mm = endAngle - this.value / this.valuesPerAngle;
			indicator.transform("r" + -mm + " " + cx + " " + cy);
			paper.circle(cx, cy, 4).attr({
				'fill': '#4684ee',
				'stroke': 'none',
				'stroke-width': 1
			});

			paper.renderfix();
		}
	}

	Gauge.defaultOptons = {
		width: 120,
		height: 120,
		startAngle: -30,
		endAngle: 210,
		radius: 60
	}
	
	window.Gauge = Gauge;
})();