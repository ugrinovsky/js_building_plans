


/* Area Class */

/**
 * Класс области
 *
 * @param points - набор узлов
 * @param id - ID области, если он известен
 * @constructor
 */
var MarkArea = function (points, id) {
    this.COLOR_RELATED = '#9F5500';
    this.COLOR_UNRELATED = '#000';
    this.ACTIVE_RELATED = '#BF7500';
    this.ACTIVE_UNRELATED = '#444';

    this.COLOR = this.COLOR_UNRELATED;
    this.ACTIVE = this.ACTIVE_UNRELATED;
    this.OPACITY = 0.5;
    this.STROKE = 2;

    this.checkPointsOrder = {
        h: [2, 1, 3],
        v: [2, 1, 3]
    };

    this.points = points;
    this.related = false;

    this.el = this.draw();

    this.setId(id);

    this.el.markType = markPainter.TYPE_AREA;
    this.el.related = false;
};

/**
 * Отрисовка области
 *
 * @returns Raphael Object
 */
MarkArea.prototype.draw = function () {
    var $this = this;

    return markPainter.paper
        .path(this.getPath())
        .attr({
            'fill': this.COLOR,
            'fill-opacity': this.OPACITY,
            'stroke-width': this.STROKE
        })
        .hover(function () {
            if (markPainter.mode !== markPainter.MODE_PAINT) {
                this.attr('fill', $this.ACTIVE);
            }
        }, function () {
            this.attr('fill', $this.COLOR);
        })
        .toBack();
};

/**
 * Формирование описания пути из координат узлов области
 *
 * @returns {string}
 */
MarkArea.prototype.getPath = function (points) {
    if (typeof(points) !== 'object') {
        points = this.points;
    }

    var path = '';

    for (var i in points) {
        path += (path === '' ? 'M' : 'L');
        path += points[i].x + ' ' + points[i].y;
    }

    return path + 'z';
};

/**
 * Устанавливает ID области
 *
 * @param id
 */
MarkArea.prototype.setId = function (id) {
    this.id = id;
    this.el.markId = id;
};

/**
 * Пометить область как отвязанную
 */
MarkArea.prototype.setUnrelated = function () {
    this.related = false;
    this.el.related = false;

    this.removeLabel();

    this.COLOR = this.COLOR_UNRELATED;
    this.ACTIVE = this.ACTIVE_UNRELATED;
    this.el.attr('fill', this.COLOR);
};

/**
 * Пометить область как связанную
 *
 * @param text - метка связанного объекта
 */
MarkArea.prototype.setRelated = function (text) {
    this.related = true;
    this.el.related = true;

    this.setLabel(text);

    this.COLOR = this.COLOR_RELATED;
    this.ACTIVE = this.ACTIVE_RELATED;
    this.el.attr('fill', this.COLOR);
};

/**
 * Задать подпись для области
 *
 * @param text - текст подписи
 */
MarkArea.prototype.setLabel = function (text) {
    this.label = new MarkLabel(text);

    this.positionLabel();
};

/**
 * Удаляет подпись области
 */
MarkArea.prototype.removeLabel = function () {
    if (this.label) {
        this.label.remove();

        this.label = null;
    }
};

/**
 * Позиционирование подписи
 */
MarkArea.prototype.positionLabel = function () {
    var checkPoints = this.getCheckPoints();
    var goodPoint = checkPoints[0];
    var areaPath = this.el.attrs.path;

    var labelBBox = this.label.el.getBBox();
    var labelHalfWidth = labelBBox.width / 2;
    var labelHalfHeight = labelBBox.height / 2;

    for (var i in checkPoints) {
        var virtualPoints = [
            { x: checkPoints[i].x - labelHalfWidth, y: checkPoints[i].y - labelHalfHeight },
            { x: checkPoints[i].x + labelHalfWidth, y: checkPoints[i].y - labelHalfHeight },
            { x: checkPoints[i].x + labelHalfWidth, y: checkPoints[i].y + labelHalfHeight },
            { x: checkPoints[i].x - labelHalfWidth, y: checkPoints[i].y + labelHalfHeight }
        ];

        if (!Raphael.pathIntersection(areaPath, this.getPath(virtualPoints)).length) {
            goodPoint = checkPoints[i];

            break;
        }
    }

    this.label.setPosition(goodPoint);
};

/**
 * Получение набора точек, подходящих для размещения подписи
 *
 * @returns {Array}
 */
MarkArea.prototype.getCheckPoints = function () {
    var defPoint;
    var points = [];
    var bBox = this.el.getBBox();
    var hPart = Math.round(bBox.width / 3);
    var vPart = Math.round(bBox.height / 3);

    for (var i in this.checkPointsOrder.h) {
        var x = Math.round((bBox.x * 2 + hPart * (this.checkPointsOrder.h[i] - 1) + hPart * this.checkPointsOrder.h[i]) / 2);

        for (var j in this.checkPointsOrder.v) {
            var y = Math.round((bBox.y * 2 + vPart * (this.checkPointsOrder.v[j] - 1) + vPart * this.checkPointsOrder.v[j]) / 2);

            if (typeof(defPoint) === 'undefined') {
                defPoint = { x: x, y: y };
            }

            if (Raphael.isPointInsidePath(this.el.attrs.path, x, y)) {
                points.push({ x: x, y: y });
            }
        }
    }

    return points || [defPoint];
};


MarkArea.prototype.getPoints = function() {
    var points = [];

    for (var i in this.points) {
        points.push({
            x: this.points[i].x,
            y: this.points[i].y
        });
    }

    return points;
};

/**
 * Возвращает сериализованный массив точек
 */
MarkArea.prototype.serialize = function () {
    var values = this.getPoints();
    return JSON.stringify(values);
};



/**
 * Удаление области и ее узлов
 */
MarkArea.prototype.remove = function () {
    for (var i in this.points) {
        this.points[i].el.remove();
    }

    this.el.remove();

    if (this.label) {
        this.label.remove();
    }
};