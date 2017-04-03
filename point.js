/**
 * Created by user on 13.05.15.
 */
/* Point Class */

/**
 * Класс узла
 *
 * @param coordinates - координаты мыши относительно канвы
 * @constructor
 */
var MarkPoint = function (coordinates, isFirst) {
    this.RADIUS = 6;
    this.COLOR = (isFirst ? '#0B0' : '#45D4FF');
    this.DEFAULT = '#FFF';
    this.ACTIVE = '#9CF';
    this.STROKE = 2;

    this.x = coordinates.x;
    this.y = coordinates.y;

    this.el = this.draw();

    this.el.markType = markPainter.TYPE_POINT;
};

/**
 * Отрисовка узла
 *
 * @returns Raphael Object
 */
MarkPoint.prototype.draw = function () {
    var $this = this;

    return markPainter.paper
        .circle(this.x, this.y, this.RADIUS)
        .attr({
            'fill': this.COLOR,
            'stroke-width': this.STROKE
        })
        .hover(function () {
            this.attr('fill', $this.ACTIVE);
        }, function () {
            this.attr('fill', $this.COLOR);
        })
        .toFront();
};

/**
 * Установка цвета узла по умолчанию
 */
MarkPoint.prototype.setDefault = function () {
    this.COLOR = this.DEFAULT;

    this.el.attr('fill', this.COLOR);
};