UtilityMixins = {

  percToDeg: (perc) ->
    perc * 360

  percToRad: (perc) ->
    @degToRad @percToDeg perc

  degToRad: (deg) ->
    deg * Math.PI / 180
}

### Components defined start ###

SVG = React.createClass(

  mixins: [UtilityMixins]

  init: () ->

    chartInset = 10
    margin = { top: 20, right: 20, bottom: 30, left: 20 }
    width = 300 - margin.left - margin.right
    height = width
    radius = Math.min(width, height) / 2

    svgData =
      svgWidth: "" + (width + margin.left + margin.right)
      svgHeight: "" + (height + margin.top + margin.bottom)
      gWidth: "" + ((width + margin.left) / 2)
      gHeight: "" + ((height + margin.top) / 2)

    # Start radius
    startPercent = @props.guageOption.startPercent
    arcData = []

    # build gauge bg
    for sectionIndex in [0..@props.guageOption.sections.length-1]

      section = @props.guageOption.sections[sectionIndex]

      arcStartRad = @percToRad startPercent
      arcEndRad = arcStartRad + @percToRad (section.percent / 2)
      startPercent += section.percent / 2

      startPadRad = if sectionIndex is 0 then 0 else @props.guageOption.paddingRadius / 2
      endPadRad = if sectionIndex is (@props.guageOption.sections.length - 1) then 0 else @props.guageOption.paddingRadius / 2

      arc = d3.svg.arc()
        .outerRadius(radius - chartInset)
        .innerRadius(radius - chartInset - @props.guageOption.barWidth)
        .startAngle(arcStartRad + startPadRad)
        .endAngle(arcEndRad - endPadRad)

      arcData.push 
        class: "arc " + section.className
        command: arc()

    @setState({
      svgWidth: "" + (width + margin.left + margin.right)
      svgHeight: "" + (height + margin.top + margin.bottom)
      gWidth: "" + ((width + margin.left) / 2)
      gHeight: "" + ((height + margin.top) / 2)
      arcData: arcData
    });

  getInitialState: () ->

    return {
      svgWidth: "0",
      svgHeight: "0",
      gWidth: "0",
      gHeight: "0",
      arcData: []
    }

  componentDidMount: () ->

    @init()

  render: () ->

    return (
      <svg width=@state.svgWidth height=@state.svgHeight>
        <G translateSize={"translate(" + @state.gWidth + ", " + @state.gHeight + ")"}
          arcData={@state.arcData}
          needleData={@props.guageOption.pointer} />
      </svg>
    );
);

G = React.createClass(

  ### Global Mixins ###

  mixins: [UtilityMixins]

  ### Custom Mixins ###

  init: () ->

    that = this
    d3.select(".chart")
      .transition()
      .delay(500)
      .ease('elastic')
      .duration(3000)
      .selectAll('.needle')
      .tween('progress', ->
        (percentOfPercent) ->
          progress = percentOfPercent * that.props.needleData.percent
          that.setState({
            command: that.mkCmd(progress)
          });
      )

  mkCmd: (perc) ->

    thetaRad = @percToRad perc / 2 # half circle

    centerX = 0
    centerY = 0

    topX = centerX - @length * Math.cos(thetaRad)
    topY = centerY - @length * Math.sin(thetaRad)

    leftX = centerX - @radius * Math.cos(thetaRad - Math.PI / 2)
    leftY = centerY - @radius * Math.sin(thetaRad - Math.PI / 2)

    rightX = centerX - @radius * Math.cos(thetaRad + Math.PI / 2)
    rightY = centerY - @radius * Math.sin(thetaRad + Math.PI / 2)

    return "M #{leftX} #{leftY} L #{topX} #{topY} L #{rightX} #{rightY}"

  ### LifeCycle ###

  getInitialState: () ->

    @length = @props.needleData.length
    @radius = @props.needleData.radius

    return {
      command: @mkCmd(0)
    }

  componentDidMount: () ->

    @init()

  render: () ->

    arcPaths = @props.arcData.map (arcPath) ->
      return (
        <ArcPath customClass=arcPath.class command=arcPath.command />
      );

    return (
      <g className="chart" ref="chart" transform=@props.translateSize>
        {arcPaths}
        <Circle radius=@radius />
        <NeedlePath command=@state.command />
      </g>
    );
);

Circle = React.createClass({

  render: () ->
    return (
      <circle className="needle-center" cx="0" cy="0" r=@props.radius />
    );
});

ArcPath = React.createClass(

  render: () ->
    return (
      <path className=@props.customClass d=@props.command />
    );
);

NeedlePath = React.createClass({

  render: () ->
    return (
      <path className="needle", d=@props.command />
    );
});

### Components defined over ###

guageOption =
  show: true
  startPercent: .75
  barWidth: 40
  paddingRadius: .05
  pointer:
    percent: .65
    length: 90
    radius: 15
  sections: [
    {
      percent: .25
      className: "chart-color1"
    }
    {
      percent: .50
      className: "chart-color2"
    }
    {
      percent: .25
      className: "chart-color3"
    }
  ]

setInterval(() ->
  React.render(
    <SVG guageOption={guageOption} />,
    document.getElementById('guage')
  );
, 500);

