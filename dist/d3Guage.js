(function() {
  var ArcPath, Circle, G, NeedlePath, SVG, UtilityMixins, guageOption;

  UtilityMixins = {
    percToDeg: function(perc) {
      return perc * 360;
    },
    percToRad: function(perc) {
      return this.degToRad(this.percToDeg(perc));
    },
    degToRad: function(deg) {
      return deg * Math.PI / 180;
    }
  };


  /* Components defined start */

  SVG = React.createClass({
    mixins: [UtilityMixins],
    init: function() {
      var arc, arcData, arcEndRad, arcStartRad, chartInset, endPadRad, height, margin, radius, section, sectionIndex, startPadRad, startPercent, svgData, width, _i, _ref;
      chartInset = 10;
      margin = {
        top: 20,
        right: 20,
        bottom: 30,
        left: 20
      };
      width = 300 - margin.left - margin.right;
      height = width;
      radius = Math.min(width, height) / 2;
      svgData = {
        svgWidth: "" + (width + margin.left + margin.right),
        svgHeight: "" + (height + margin.top + margin.bottom),
        gWidth: "" + ((width + margin.left) / 2),
        gHeight: "" + ((height + margin.top) / 2)
      };
      startPercent = this.props.guageOption.startPercent;
      arcData = [];
      for (sectionIndex = _i = 0, _ref = this.props.guageOption.sections.length - 1; 0 <= _ref ? _i <= _ref : _i >= _ref; sectionIndex = 0 <= _ref ? ++_i : --_i) {
        section = this.props.guageOption.sections[sectionIndex];
        arcStartRad = this.percToRad(startPercent);
        arcEndRad = arcStartRad + this.percToRad(section.percent / 2);
        startPercent += section.percent / 2;
        startPadRad = sectionIndex === 0 ? 0 : this.props.guageOption.paddingRadius / 2;
        endPadRad = sectionIndex === (this.props.guageOption.sections.length - 1) ? 0 : this.props.guageOption.paddingRadius / 2;
        arc = d3.svg.arc().outerRadius(radius - chartInset).innerRadius(radius - chartInset - this.props.guageOption.barWidth).startAngle(arcStartRad + startPadRad).endAngle(arcEndRad - endPadRad);
        arcData.push({
          "class": "arc " + section.className,
          command: arc()
        });
      }
      return this.setState({
        svgWidth: "" + (width + margin.left + margin.right),
        svgHeight: "" + (height + margin.top + margin.bottom),
        gWidth: "" + ((width + margin.left) / 2),
        gHeight: "" + ((height + margin.top) / 2),
        arcData: arcData
      });
    },
    getInitialState: function() {
      return {
        svgWidth: "0",
        svgHeight: "0",
        gWidth: "0",
        gHeight: "0",
        arcData: []
      };
    },
    componentDidMount: function() {
      return this.init();
    },
    render: function() {
      return React.createElement("svg", {
        "width": this.state.svgWidth,
        "height": this.state.svgHeight
      }, React.createElement(G, {
        "translateSize": "translate(" + this.state.gWidth + ", " + this.state.gHeight + ")",
        "arcData": this.state.arcData,
        "needleData": this.props.guageOption.pointer
      }));
    }
  });

  G = React.createClass({

    /* Global Mixins */
    mixins: [UtilityMixins],

    /* Custom Mixins */
    init: function() {
      var that;
      that = this;
      return d3.select(".chart").transition().delay(500).ease('elastic').duration(3000).selectAll('.needle').tween('progress', function() {
        return function(percentOfPercent) {
          var progress;
          progress = percentOfPercent * that.props.needleData.percent;
          return that.setState({
            command: that.mkCmd(progress)
          });
        };
      });
    },
    mkCmd: function(perc) {
      var centerX, centerY, leftX, leftY, rightX, rightY, thetaRad, topX, topY;
      thetaRad = this.percToRad(perc / 2);
      centerX = 0;
      centerY = 0;
      topX = centerX - this.length * Math.cos(thetaRad);
      topY = centerY - this.length * Math.sin(thetaRad);
      leftX = centerX - this.radius * Math.cos(thetaRad - Math.PI / 2);
      leftY = centerY - this.radius * Math.sin(thetaRad - Math.PI / 2);
      rightX = centerX - this.radius * Math.cos(thetaRad + Math.PI / 2);
      rightY = centerY - this.radius * Math.sin(thetaRad + Math.PI / 2);
      return "M " + leftX + " " + leftY + " L " + topX + " " + topY + " L " + rightX + " " + rightY;
    },

    /* LifeCycle */
    getInitialState: function() {
      this.length = this.props.needleData.length;
      this.radius = this.props.needleData.radius;
      return {
        command: this.mkCmd(0)
      };
    },
    componentDidMount: function() {
      return this.init();
    },
    render: function() {
      var arcPaths;
      arcPaths = this.props.arcData.map(function(arcPath) {
        return React.createElement(ArcPath, {
          "customClass": arcPath["class"],
          "command": arcPath.command
        });
      });
      return React.createElement("g", {
        "className": "chart",
        "ref": "chart",
        "transform": this.props.translateSize
      }, arcPaths, React.createElement(Circle, {
        "radius": this.radius
      }), React.createElement(NeedlePath, {
        "command": this.state.command
      }));
    }
  });

  Circle = React.createClass({
    render: function() {
      return React.createElement("circle", {
        "className": "needle-center",
        "cx": "0",
        "cy": "0",
        "r": this.props.radius
      });
    }
  });

  ArcPath = React.createClass({
    render: function() {
      return React.createElement("path", {
        "className": this.props.customClass,
        "d": this.props.command
      });
    }
  });

  NeedlePath = React.createClass({
    render: function() {
      return React.createElement("path", {
        "className": "needle",
        "d": this.props.command
      });
    }
  });


  /* Components defined over */

  guageOption = {
    show: true,
    startPercent: .75,
    barWidth: 40,
    paddingRadius: .05,
    pointer: {
      percent: .65,
      length: 90,
      radius: 15
    },
    sections: [
      {
        percent: .25,
        className: "chart-color1"
      }, {
        percent: .50,
        className: "chart-color2"
      }, {
        percent: .25,
        className: "chart-color3"
      }
    ]
  };

  setInterval(function() {
    return React.render(React.createElement(SVG, {
      "guageOption": guageOption
    }), document.getElementById('guage'));
  }, 500);

}).call(this);
