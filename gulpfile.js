//флаг --save-dev нужен для того, чтобы сохранялись версии устанавливаемых пакетов


//итоговый каталог для заказчика
// динамическое имя с именем общего каталога (выяснить как внести его в гит игнор)
// let project_folder = require("path").basename(__dirname);
let project_folder = "dist";
//каталог исходников
let source_folder = "#src";

let fs = require('fs');

//Переменная path, которая содержит объекты, которые в свою очередь будут содержать пути к файлам и папкам
let path = {
    // пути вывода (куда галп будет выгружать обработанные файлы)

    //для каталога с результатом
    build: {
        //пути к файлам
        html: project_folder + "/",
        css: project_folder + "/css/",
        js: project_folder + "/js/",
        img: project_folder + "/images/",
        fonts: project_folder + "/fonts/",
        video: project_folder + "/video/",
        doc: project_folder + "/documents/",
    },
    //для каталога с исходниками
    src: {
        //исключаем файлы с _*.html из сборки
        html: [source_folder + "/*.html", "!" + source_folder + "/_*.html"],
        //исключаем файлы с _*.pug из сборки
        pug: [source_folder + "/pug/*.pug", "!" + source_folder + "/pug/_*.pug"],
        //конкретный файл, который будет обрабатываться галпом, а не все scss файлы в этой папке
        css: source_folder + "/scss/main.scss",
        //Файл js, в котором будут через @@include подключаться остальные скрипты
        js: source_folder + "/js/app.js",
        // слушаем все подпапки в папке images например, content или icons
        // и выбираем только файлы с нужными расширениями
        img: source_folder + "/images/**/*.{jpg,png,svg,gif,ico,webp}",
        fonts: source_folder + "/fonts/*.ttf",
        video: source_folder + "/video/**/*.*",
        doc: source_folder + "/documents/**/*.*",
    },
    //объект watch, который содержит пути к файлам, которые мы будем слушать постоянно, т.е.
    //отлавливать их изменения и выполнять
    watch: {
        //слушаем всё, что является нужным файлом
        html: source_folder + "/**/*.html",
        pug: source_folder + "/**/*.pug",
        css: source_folder + "/**/*.scss",
        js: source_folder + "/**/*.js",
        img: source_folder + "/images/**/*.{jpg,png,svg,gif,ico,webp}",
        video: source_folder + "/video/**/*.*",
        doc: source_folder + "/documents/**/*.*",
    },
    //объект CLEAN содержит путь к каталгу проекта и отвечает за удаление этого каталога
    //каждый раз, когда мы будем запускать gulp
    clean: "./" + project_folder + "/"
}

//переменные, которые помогут в написании сценария
//переменным будет присвоен сам 'gulp'
let {src, dest} = require('gulp'),
    //создадим отдельную переменную gulp, которой тоже присвоим 'gulp' для выполнения иных задач
    gulp = require('gulp'),
    //назначение переменной для плагина browser-sync
    browsersync = require("browser-sync").create(),
    fileinclude = require("gulp-file-include"),
    del = require("del"),
    scss = require("gulp-sass")(require('sass')),
    autoprefixer = require("gulp-autoprefixer"),
    group_media = require("gulp-group-css-media-queries"),
    clean_css = require("gulp-clean-css"),
    rename = require("gulp-rename"),
    uglify = require("gulp-uglify-es").default,
    concat = require("gulp-concat"),
    imagemin = require("gulp-imagemin"),
    imageminGifsicle = require('imagemin-gifsicle'),
    recompress = require("imagemin-jpeg-recompress"), //тоже пережимает, но лучше. Плагин для плагина
    pngquant = require("imagemin-pngquant"),
    // webp = require("gulp-webp"),
    // webphtml = require("gulp-webp-html"),
    svgSprite = require("gulp-svg-sprite"),
    ttf2woff = require("gulp-ttf2woff"),
    ttf2woff2 = require("gulp-ttf2woff2"),
    fonter = require("gulp-fonter"),
    size = require("gulp-filesize"),
    babel = require("gulp-babel"), //переводит js-файлы в формат, понятный даже тупому ослику(IE). Если точнее, конвертирует javascript стандарта ES6 в ES5
    sourcemaps = require("gulp-sourcemaps"); //рисует карту слитого воедино файла, чтобы было понятно, что из какого файла бралось
    plumber = require('gulp-plumber')
    pug = require('gulp-pug')
    pugLinter = require('gulp-pug-linter')

    bemValidator = require('gulp-html-bem-validator')
    notify = require('gulp-notify')
    cache = require('gulp-cache'); // Подключаем библиотеку кеширования


// Обработчик ошибок
function errorHandler() {
    var args = Array.prototype.slice.call(arguments);
    notify.onError({
        title: 'Compile Error',
        message: '<%= error.message %>',
        sound: 'Submarine'
    }).apply(this, args);
    this.emit('end');
}

// Работа с pug
function pug2html() {
  return src(path.src.pug)
    .pipe(plumber())
    .pipe(pugLinter({ reporter: 'default' }))
    .pipe(pug({ pretty: false }))
    .pipe(webphtml())

    .pipe(bemValidator())
    .pipe(dest(path.build.html))
    .pipe(browsersync.stream())
}

// функция для работы с html файлами
function html() {
    return src(path.src.html)
        //сборка файлов через fileinclude
        .pipe(fileinclude())
        // .pipe(webphtml())

        .pipe(bemValidator())
        .pipe(dest(path.build.html)) //выгрузка
        .pipe(browsersync.stream())
}


function cssLibs() {
    //библиотека из css-стилей плагинов
    return src([
        "node_modules/normalize.css/normalize.css",
    ])
        .pipe(sourcemaps.init())
        .pipe(concat("libs.css")) //склеиваем их в один файл с указанным именем
        .pipe(
            autoprefixer({
                overrideBrowserslist: ["last 5 versions"],
                cascade: true
            })
        )
        .pipe(dest(path.build.css)) //кидаем несжатый файл в директорию результата
        .pipe(clean_css({
            compatibility: "ie8",
            level: {
                1: {
                    specialComments: 0,
                    removeEmpty: true,
                    removeWhitespace: true,
                },
                2: {
                    mergeMedia: true,
                    removeEmpty: true,
                    removeDuplicateFontRules: true,
                    removeDuplicateMediaBlocks: true,
                    removeDuplicateRules: true,
                    removeUnusedAtRules: true,
                },
            },
        }))
        .pipe(
            rename({
                extname: ".min.css"
            })
        )
        .pipe(sourcemaps.write('.'))
        .pipe(dest(path.build.css)) //кидаем готовый файл в директорию
}

//Функция обработки стилей
function css() {
    return src(path.src.css)
        .pipe(sourcemaps.init()) //инициализируем sourcemaps, чтобы он начинал записывать, что из какого файла берётся
        .pipe(plumber({ errorHandler: errorHandler }))
        .pipe(
            scss({
                //формирование развернутого (не сжатого) css файла
                outputStyle: "expanded"
            })
        )
        .pipe(
            autoprefixer({
                overrideBrowserslist: ["last 5 versions"],
                cascade: true
            })
        )
        .pipe(
            group_media()
        )
        .pipe(dest(path.build.css)) //выгрузка
        .pipe(clean_css({
            compatibility: "ie8",
            level: {
                1: {
                    specialComments: 0,
                    removeEmpty: true,
                    removeWhitespace: true,
                },
                2: {
                    mergeMedia: true,
                    removeEmpty: true,
                    removeDuplicateFontRules: true,
                    removeDuplicateMediaBlocks: true,
                    removeDuplicateRules: true,
                    removeUnusedAtRules: true,
                },
            },
        }))
        .pipe(
            rename({
                extname: ".min.css"
            })
        )
        .pipe(sourcemaps.write('.')) //записываем карту в итоговый файл
        .pipe(dest(path.build.css))
        .pipe(browsersync.stream())
}

function jsLibs() {
    return src([
        //подключаем разные js в общую библиотеку.
        "node_modules/ityped/dist/index.min.js"
    ])
        //pipe - функция, внутри которой мы пишем команды для gulp
        .pipe(plumber({ errorHandler: errorHandler }))
        .pipe(concat("libs.js"))
        .pipe(dest(path.build.js)) //выгрузка несжатого
        .pipe(
            uglify() // сжимаем
        )
        .pipe(
            rename({
                extname: ".min.js"
            })
        )
        .pipe(dest(path.build.js)) //выгрузка сжатого
        .pipe(browsersync.stream())
}

function js() {
    return src(path.src.js)
        //сборка файлов через fileinclude
        .pipe(fileinclude())
        .pipe(plumber({ errorHandler: errorHandler }))
        //pipe - функция, внутри которой мы пишем команды для gulp
        .pipe(babel())
        .pipe(sourcemaps.init())
        .pipe(dest(path.build.js)) //выгрузка
        .pipe(
            uglify()
        )
        .pipe(
            rename({
                extname: ".min.js"
            })
        )
        .pipe(sourcemaps.write('.'))
        .pipe(dest(path.build.js))
        .pipe(browsersync.stream())
}

function images() {
    return src(path.src.img)
        // .pipe(
        //     webp({
        //         quality: 70
        //     })
        // )
        // .pipe(dest(path.build.img)) //выгрузка
        // .pipe(src(path.src.img))  //обращение к исходникам
        .pipe(cache(
            imagemin(
                [
                    recompress({
                        //Настройки сжатия изображений. Сейчас всё настроено так, что сжатие почти незаметно для глаза на обычных экранах. Можете покрутить настройки, но за результат не отвечаю.
                        loops: 4, //количество прогонок изображения
                        min: 80, //минимальное качество в процентах
                        max: 100, //максимальное качество в процентах
                        quality: "high", //тут всё говорит само за себя, если хоть капельку понимаешь английский
                        use: [pngquant({strip: true})],
                    }),
                    imagemin.gifsicle({interlaced: true}), //тут и ниже всякие плагины для обработки разных типов изображений
                    imagemin.mozjpeg({
                        quality: 75,
                        progressive: true
                    }),
                    imagemin.optipng({ optimizationLevel: 5 }),
                    imagemin.svgo({
                        plugins: [
                            { removeViewBox: true },
                            { cleanupIDs: false }
                        ]
                    }),
                ],
                {
                    progressive: true,
                    svgoPlugins: [{removeViewBox: false}],
                    interlaced: true,
                    optimizationLevel: 3 // 0 to 7
                }
            ),
        ))
        .pipe(dest(path.build.img))
        .pipe(browsersync.stream());
}

//Очистка кэша, если возикнут траблы с картинками (cmd: gulp clear)
gulp.task('clear', function () {
    return cache.clearAll();
})

// auto copy converted fonts to dist
const copyFonts = () =>
    src(source_folder + '/fonts/*.{woff,woff2,svg}')
        .pipe(dest(path.build.fonts));

// auto copy videos
const copyVideo = () =>
    src(path.src.video)
        .pipe(dest(path.build.video));

// auto copy documents
const copyDoc = () =>
    src(path.src.doc)
        .pipe(dest(path.build.doc));

//auto convert. .ttf-to-.woff + copy to dist - bad (too much time on every run)
//to turn it on: add "fonts" to gulp.parallel series
function fonts(params) {
    src(path.src.fonts)
        .pipe(ttf2woff())
        .pipe(dest(path.build.fonts));
    return src(path.src.fonts)
        .pipe(ttf2woff2())
        .pipe(dest(path.build.fonts));
}

// manual convert. .ttf-to-.woff + copy to dist
// command: "gulp ttf2woff"
gulp.task('ttf2woff', function () {
    src(path.src.fonts)
        .pipe(ttf2woff())
        .pipe(dest(source_folder + '/fonts/'));
    return src(path.src.fonts)
        .pipe(ttf2woff2())
        .pipe(dest(source_folder + '/fonts/'));
})

gulp.task('otf2ttf', function () {
    return src([source_folder + '/fonts/*.otf'])
        .pipe(fonter({
            formats: ['ttf']
        }))
        .pipe(dest(source_folder + '/fonts/'));
})


const svgSprites = () => {
    return gulp.src([source_folder + '/images/svgSprite/*.svg'])
        .pipe(svgSprite({
            mode: {
                stack: {
                    //куда будет выводиться готовый собранный файл
                    sprite: "../svgSprite.svg", //sprite file name
                    //создание html файла с примером иконок
                    example: true
                }
            },
        }))
        .pipe(dest(path.build.img)); //выгрузка
}


//функция подключения шрифтов к стилям
function fontsStyle(params) {

    let file_content = fs.readFileSync(source_folder + '/scss/base/_fonts.scss');
    if (file_content == '') {
        fs.writeFile(source_folder + '/scss/_fonts.scss', '', cb);
        return fs.readdir(path.build.fonts, function (err, items) {
            if (items) {
                let c_fontname;
                for (var i = 0; i < items.length; i++) {
                    let fontname = items[i].split('.');
                    fontname = fontname[0];
                    if (c_fontname != fontname) {
                        fs.appendFile(source_folder + '/scss/base/_fonts.scss', '@include font("' + fontname + '", "' + fontname + '", "400", "normal");\r\n', cb);
                    }
                    c_fontname = fontname;
                }
            }
        })
    }
}

function cb() {
}



//Функция, которая будет обновлять страницу
function browserSync(params) {
    //обращаемся к переменной
    browsersync.init({
        //тут указываются настройки плагина
        server: {
            baseDir: "./" + project_folder + "/",
            // directory: true,
            // index: "index.html"
        },
        port: 5000,
        notify: false,
        injectChanges: false
    })

    gulp.watch([path.watch.html], html);
    gulp.watch([path.watch.css], css);
    gulp.watch([path.watch.js], js);
    gulp.watch([path.watch.img], images);
    gulp.watch([path.watch.video], copyVideo);
    gulp.watch([path.watch.doc], copyDoc);
}

// без этой шляпы browserSync не обновляет html
function watchHtml(done) {
    gulp.watch([path.watch.html], cb => {
        browsersync.reload();
        cb();
    });
    done();
}

//Функция, кот. будет чистить(удалять) папку result
function clean(params) {
    return del(path.clean);
}

let build = gulp.series(clean, gulp.parallel(jsLibs, js, html, cssLibs, css, images, svgSprites, copyFonts, copyVideo, copyDoc), fontsStyle);
//сценарий выполнения watch
let watch = gulp.parallel(build, watchHtml, browserSync);

// gulp.task("default", gulp.parallel("style", "script"));

//подружим gulp с новыми переменными, чтобы он их понимал и работал с ними

exports.fontsStyle = fontsStyle;
exports.svgSprites = svgSprites;
// exports.fonts = fonts;
exports.copyVideo = copyVideo;
exports.copyDoc = copyDoc;
exports.copyFonts = copyFonts;
exports.images = images;
exports.js = js;
exports.jsLibs = jsLibs;
exports.css = css;
exports.cssLibs = cssLibs;
exports.html = html;
// exports.pug2html = pug2html;
exports.build = build;
exports.watch = watch;
exports.watchHtml = watchHtml;
exports.default = watch;
