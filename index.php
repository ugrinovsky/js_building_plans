<!DOCTYPE>
<head>
    <script type="text/javascript" src="https://code.jquery.com/jquery-3.2.0.js"></script>
    <script type="text/javascript" src="raphael.js"></script>
    <script type="text/javascript" src="label.js"></script>
    <script type="text/javascript" src="area.js"></script>
    <script type="text/javascript" src="mark.js"></script>
    <script type="text/javascript" src="point.js"></script>
    <script type="text/javascript" src="line.js"></script>
    <script type="text/javascript" src="show.js"></script>
    <style type="text/css">
        .planning-container {
            width: 100%;
            overflow-x: auto;
            overflow-y: hidden;
            margin-top: 30px;
        }
    </style>
</head>
<body>
    
    <div id="painter-context-menu-layer" class="popover right" style="display: none">
        <h3 class="popover-title">Действия</h3>
        <div class="popover-content">
            <div class="actions btn-group">
                <!-- <a data-toggle="modal" data-remote="false" data-target="#relate-area-layer" class="btn btn-block btn-sm btn-default painter-context-menu-relate" href="">Связать с планировкой</a> -->
                <!-- <a class="btn btn-block btn-sm btn-default painter-context-menu-unrelate" href="#">Отвязать планировку</a> -->

                <a class="btn btn-block btn-sm margin-bottom-5 btn-danger painter-context-menu-delete" href="#">Удалить область</a>
            </div>
        </div>
    </div>

    <div class="planning-container">
        <div id="layout-canvas" data-list-area-url="list.php" data-save-area-url="save.php" data-delete-area-url="delete.php" data-relate-area-url="relate.php" data-unrelate-area-url="unrelate.php" data-role-create="true" data-role-edit="true" data-role-delete="true">
            <!-- width: 3000px; height: 1298px; -->
            <img src="f65218f1bae5442cba9ab1d61c410c0f.png">
        </div>
    </div>

    <!-- <div id="delete-preset-layout-layer" class="modal fade" tabindex="-1" data-backdrop="static" data-keyboard="false">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">×</span></button>
                    <h4 class="modal-title">
                        Удаление планировки                    
                    </h4>
                </div>
                <div class="modal-body layer-inner">
                </div>
            </div>
        </div>
    </div> -->
</body>


