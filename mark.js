var markPainter;

/* Painter Class */

/**
 * Класс редактора разметки
 *
 * @param canvas - jQuery-объект для канвы
 * @param options - опции
 * @constructor
 */
var MarkPainter = function (canvas, options) {
    markPainter = this;
    this.isShift = false;

    markPainter.MODE_IDLE = 'Idle';
    markPainter.MODE_PAINT = 'Paint';
    markPainter.MODE_MENU = 'Menu';

    markPainter.TYPE_TOOL = 'Tool';
    markPainter.TYPE_LINE = 'Line';
    markPainter.TYPE_POINT = 'Point';
    markPainter.TYPE_AREA = 'Area';
    markPainter.TYPE_LABEL = 'Label';

    markPainter.nonTargetTypes = [
        markPainter.TYPE_TOOL,
        markPainter.TYPE_LINE,
        markPainter.TYPE_LABEL
    ];

    markPainter.BUTTON_LEFT = 1;
    markPainter.BUTTON_RIGHT = 3;

    markPainter.canvas = canvas;
    markPainter.paper = Raphael(canvas.attr('id'), canvas.width(), canvas.height());
    markPainter.toolLine = markPainter.drawToolLine();

    markPainter.options = $.extend({
        functionContextMenu: null,
        functionContextMenuHide: null
    }, options);

    markPainter.listAreaUrl = canvas.data('list-area-url');
    markPainter.saveAreaUrl = canvas.data('save-area-url');
    markPainter.deleteAreaUrl = canvas.data('delete-area-url');
    markPainter.relateAreaUrl = canvas.data('relate-area-url');
    markPainter.unrelateAreaUrl = canvas.data('unrelate-area-url');

    markPainter.roleIsGranted = {
        create: canvas.data('role-create'),
        edit:   canvas.data('role-edit'),
        delete: canvas.data('role-delete')
    };

    markPainter.mode = markPainter.MODE_IDLE;
    markPainter.currentPath = [];
    markPainter.tempLines = [];
    markPainter.areas = [];
    markPainter.activeArea = null;

    markPainter.initAreas();
    markPainter.bindEvents();

    document.addEventListener('keydown', function (event) {
        if (event.shiftKey){
            markPainter.isShift = true;
        }
    });

    document.addEventListener('keyup', function (event) {
        if (event.keyCode == 16) {
            markPainter.isShift = false;
        }
    });

};

/**
 * Получение координат мыши относительно канвы
 *
 * @param e - событие клика
 * @returns {{x: number, y: number}}
 */
MarkPainter.prototype.getCoordinates = function (e) {
    return {
        x: e.pageX - 1 - this.canvas.offset().left,
        y: e.pageY - 1 - this.canvas.offset().top
    };
};

/**
 * Загрузка сохраненных областей
 */
MarkPainter.prototype.initAreas = function () {
    var $this = this;

    $.getJSON(this.listAreaUrl, function (response) {
        if (response.success) {
            $this.drawAreas(response.areas);
        }
    });
};

/**
 * Отрисовка сохраненных областей
 */
MarkPainter.prototype.drawAreas = function (areas) {
    for (var a in areas) {
        console.log(areas[a])
        var points = $.parseJSON(areas[a].points);
        for (var p in points) {
            // console.log(points)
            this.addPoint({
                x: points[p].x,
                y: points[p].y
            });
        }

        this.closePath(areas[a].id, areas[a].preset);
    }
};

/**
 * Назначение событий канвы
 */
MarkPainter.prototype.bindEvents = function () {
    var $this = this;

    this.canvas
        .contextmenu(function (e) {
            e.preventDefault();
        })
        .mouseup(function (e) {
            var method = 'click' + e.which;

            var target = false;
            var coordinates = $this.getCoordinates(e);

            var clickedElements = $this.paper.getElementsByPoint(coordinates.x, coordinates.y);

            clickedElements.forEach(function (el) {
                if ($this.nonTargetTypes.indexOf(el.markType) < 0) {
                    target = el;
                }
            });

            if (typeof($this[method]) === 'function') {
                $this[method].call($this, coordinates, target);
            }
        })
        .mousemove(function (e) {
            if ($this.mode === $this.MODE_PAINT) {
                $this.reDrawToolLine(e);
            }
        });
};

/**
 * Создание вспомогательной линии
 *
 * @returns {MarkLine}
 */
MarkPainter.prototype.drawToolLine = function () {
    var toolLine = new MarkLine();

    toolLine.el.markType = this.TYPE_TOOL;

    return toolLine;
};

/**
 * Перерисовка вспомогательной линии при движении мышью
 *
 * @param coordinates - координаты мыши относительно канвы или событие клика
 */
MarkPainter.prototype.reDrawToolLine = function (coordinates) {
    if (typeof(coordinates.x) === 'undefined' && typeof(coordinates.y) === 'undefined') {
        coordinates = this.getCoordinates(coordinates);
    }

    coordinates = this.shiftCoordinatesTransform(coordinates);

    this.toolLine.reDraw(this.currentPath[this.currentPath.length - 1], coordinates);
};

/**
 * Левый клик
 *
 * @param coordinates - координаты курсора относительно канвы
 * @param target - цель клика
 */
MarkPainter.prototype.click1 = function (coordinates, target) {
    var method = 'click1Mode' + this.mode + (target ? target.markType : '');

    if (typeof(this[method]) === 'function') {
        this[method].call(this, coordinates, target);
    }
};

/**
 * Левый клик в режиме простоя по пустому месту
 *
 * @param coordinates - координаты курсора относительно канвы
 */
MarkPainter.prototype.click1ModeIdle = function (coordinates) {
    if (markPainter.roleIsGranted.create) {
        this.addPoint(coordinates);

        this.mode = this.MODE_PAINT;
    }
};

/**
 * Левый клик в режиме простоя по узлу
 *
 * @param coordinates - координаты курсора относительно канвы
 * @param point - узел
 */
MarkPainter.prototype.click1ModeIdlePoint = function (coordinates, point) {
    if (markPainter.roleIsGranted.create) {
        this.addPoint({
            x: point.attrs.cx,
            y: point.attrs.cy
        });

        this.mode = this.MODE_PAINT;
    }
};

/**
 * Левый клик в режиме простоя по области
 */
MarkPainter.prototype.click1ModeIdleArea = function (coordinates, area) {
    this.click3ModeIdleArea(coordinates, area);
};

/**
 * Левый клик в режиме рисования по пустому месту
 *
 * @param coordinates - координаты курсора относительно канвы
 */
MarkPainter.prototype.click1ModePaint = function (coordinates) {
    coordinates = this.shiftCoordinatesTransform(coordinates);

    this.addPoint(coordinates);

    this.drawLine();
};

/**
 * Левый клик в режиме рисования по узлу
 *
 * @param coordinates - координаты курсора относительно канвы
 * @param point - узел
 */
MarkPainter.prototype.click1ModePaintPoint = function (coordinates, point) {
    if (this.currentPath[0].el === point) {

        this.closePath();

    } else if (!this.inCurrentPath(point)) {
        this.click1ModePaint({
            x: point.attrs.cx,
            y: point.attrs.cy
        });
    }
};

/**
 * Левый клик в режиме рисования по области
 *
 * @param coordinates - координаты курсора относительно канвы
 */
MarkPainter.prototype.click1ModePaintArea = function (coordinates) {
    this.click1ModePaint(coordinates);
};

/**
 * Правый клик
 *
 * @param coordinates - координаты курсора относительно канвы
 * @param target - цель клика
 */
MarkPainter.prototype.click3 = function (coordinates, target) {
    var method = 'click3Mode' + this.mode + (target && this.mode === this.MODE_IDLE ? target.markType : '');

    if (typeof(this[method]) === 'function') {
        this[method].call(this, coordinates, target);
    }
};

/**
 * Правый клик по области в режиме простоя
 *
 * @param coordinates - координаты курсора относительно канвы
 * @param area - область
 */
MarkPainter.prototype.click3ModeIdleArea = function (coordinates, area) {
    console.log('execute menu');
    if (markPainter.roleIsGranted.edit || markPainter.roleIsGranted.delete) {
        this.executeContextMenu(coordinates, area);
    }
};

/**
 * Правый клик в режиме рисования
 *
 * @param coordinates - координаты курсора относительно канвы
 */
MarkPainter.prototype.click3ModePaint = function (coordinates) {
    if (markPainter.currentPath.length) {
        markPainter.currentPath.pop().el.remove();
    }

    if (markPainter.tempLines.length) {
        markPainter.tempLines.pop().el.remove();
    }

    if (markPainter.currentPath.length) {
        markPainter.reDrawToolLine(coordinates);
    } else {
        this.cancelDrawing();
    }
};

/**
 * Левый клик в режиме меню
 */
MarkPainter.prototype.click1ModeMenu = function () {
    this.executeContextMenuHide();
};

/**
 * Левый клик в режиме меню
 */
MarkPainter.prototype.click1ModeMenuArea = function (coordinates, area) {
    this.click3ModeMenu(coordinates, area);
};

/**
 * Правый клик в режиме меню
 */
MarkPainter.prototype.click3ModeMenu = function (coordinates, target) {
    if (target.markType === this.TYPE_AREA) {
        this.click3ModeIdleArea(coordinates, target);
    } else {
        this.click1ModeMenu(coordinates, target);
    }
};

/**
 * Вызов функции "Контекстное меню"
 *
 * @param coordinates - координаты курсора относительно канвы
 * @param area - область
 */
MarkPainter.prototype.executeContextMenu = function (coordinates, area) {
    if (typeof(this.options.functionContextMenu) === 'function') {
        this.options.functionContextMenu(coordinates, area);

        this.activeArea = area;

        this.mode = this.MODE_MENU;
    }
};

/**
 * Вызов функции "Скрытие контекстного меню"
 */
MarkPainter.prototype.executeContextMenuHide = function () {
    if (typeof(this.options.functionContextMenuHide) === 'function') {
        this.options.functionContextMenuHide();

        this.activeArea = null;

        this.mode = this.MODE_IDLE;
    }
};

/**
 * Узел является частью текущего пути
 *
 * @param point - узел
 * @returns {boolean}
 */
MarkPainter.prototype.inCurrentPath = function (point) {
    for (var i in this.currentPath) {
        if (this.currentPath[i].el === point) {
            return true;
        }
    }

    return false;
};

/**
 * Добавление узла
 *
 * @param coordinates - координаты курсора относительно канвы
 */
MarkPainter.prototype.addPoint = function (coordinates) {
    var isFirst = (this.currentPath.length ? false : true);

    if (this.currentPath.length > 1) {
        this.currentPath[this.currentPath.length - 1].setDefault();
    }

    this.currentPath.push(new MarkPoint(coordinates, isFirst));
};

/**
 * Соединение двух последних узлов линией
 */
MarkPainter.prototype.drawLine = function () {
    this.tempLines.push(new MarkLine(
        this.currentPath[markPainter.currentPath.length - 2],
        this.currentPath[markPainter.currentPath.length - 1]
    ));
};

/**
 * Завершение рисования пути
 *
 * @param areaId - ID области, если она отрисовывается при инициализации
 * @param preset - пресет, если область связана
 */
MarkPainter.prototype.closePath = function (areaId, preset) {
    // console.log('area id'+areaId)
    var area = new MarkArea(this.currentPath, areaId);

    if (preset) {
        area.setRelated(preset.code);
    }

    this.addArea(area);

    this.currentPath[0].setDefault();
    this.currentPath[this.currentPath.length - 1].setDefault();

    this.cancelDrawing();
};

/**
 * Добавление области к разметке
 *
 * @param area - область
 */
MarkPainter.prototype.addArea = function (area) {
    var $this = this;

    if (area.id) {
        this.areas.push(area);
    } else {
        // /*
        // @TODO define default save method, allow to redeclare
        //  */
        $.post(markPainter.saveAreaUrl, { points: area.serialize() }, function (response) {
            response = $.parseJSON(response);
            if (response.success) {
                area.setId(response.area.id);

                $this.areas.push(area);
            } else {
                area.remove();
            }
        });
    }
};

/**
 * Отмена режима рисования и переход в режим простоя
 */
MarkPainter.prototype.cancelDrawing = function () {
    for (var i in this.tempLines) {
        this.tempLines[i].el.remove();
    }

    this.toolLine.reDraw();

    this.mode = this.MODE_IDLE;
    this.currentPath = [];
    this.tempLines = [];
};

MarkPainter.prototype.getArea = function (markId, remove) {
    for (var i in this.areas) {
        if (this.areas[i] && this.areas[i].id === markId) {
            var area = this.areas[i];

            remove && delete this.areas[i];

            return area;
        }
    }

    return null;
};

/**
 * Удаляет выделенную область
 */
MarkPainter.prototype.deleteActiveArea = function () {
    if (this.activeArea !== null) {
        var area = this.getArea(this.activeArea.markId, true);
        if (area !== null) {

            $.post(markPainter.deleteAreaUrl, { id: area.id }, function (response) {
                response = $.parseJSON(response);
                if (response.success) {
                    area.remove();
                }
            });
        }

        this.activeArea = null;
    }
};

/**
 * Связывает выделенную область с пресетом
 *
 * @param presetId - ID пресета
 */
MarkPainter.prototype.relateActiveArea = function (presetId) {
    if (this.activeArea !== null) {
        var area = this.getArea(this.activeArea.markId);

        if (area !== null) {

            $.post(markPainter.relateAreaUrl, { areaId: area.id, presetId: presetId }, function (response) {

                if (response.success) {
                    if (typeof response.preset.code !== 'undefined') {
                        area.setRelated(response.preset.code);
                    }

                }
            });
        }
    }
};

/**
 * Отвязывает область от пресета
 */
MarkPainter.prototype.unrelateActiveArea = function () {
    if (this.activeArea !== null) {
        var area = this.getArea(this.activeArea.markId);

        if (area !== null) {

            $.post(markPainter.unrelateAreaUrl, { id: area.id }, function (response) {

                if (response.success) {
                    area.setUnrelated();
                }
            });
        }
    }
};


MarkPainter.prototype.shiftCoordinatesTransform = function (coordinates) {
    var x1 = this.currentPath[this.currentPath.length - 1].x,
        x2 = coordinates.x,
        y1 = this.currentPath[this.currentPath.length - 1].y,
        y2 = coordinates.y,
        angle = 0;


    //// При зажатом шифте рисуем прямые линии
    if (this.isShift) {
        angle = Math.atan((y2 - y1) / (x2 - x1)) * (180/Math.PI) ;
        if (angle >= 0 && angle <=90) {
            if (angle > 45) {
                coordinates.x = x1;
            } else {
                coordinates.y = y1;
            }
        } else {
            if (angle < -45) {
                coordinates.x = x1;
            } else {
                coordinates.y = y1;
            }
        }
    }

    return coordinates;
}