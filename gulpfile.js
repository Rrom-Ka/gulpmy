//'экспорт инструментов для того чтоб их использвать объявлем их в переменную//
const { src, dest, series, watch } = require('gulp');
const concat = require('gulp-concat');
const htmlMin = require('gulp-htmlmin');
const autoprefixer = require('gulp-autoprefixer');
const cleanCSS = require('gulp-clean-css');
const svgSprite = require('gulp-svg-sprite');
const imagen = require('gulp-image');
const babel = require('gulp-babel');
const uglify = require('gulp-uglify-es').default;
const del = require('del');
const notify = require('gulp-notify');
const sourcemaps = require('gulp-sourcemaps');
const browserSync = require('browser-sync').create();//вызывает ф-ю create по спецификации

//удвление дирректорий
const cleaner = () => {
  return del(['dist'])
}

//перенос recources без зависимостей
const recources = () => {
  return src('src/recources/**') //берем из папки и переносим
    .pipe(dest('dist'))
}

//функция обработка стилей  (gulp task)
const styles = () => {
  return src('src/styles/**/*.css') //получаем ф-лф из папки и ф-лов
  .pipe(concat('main.css')) // объединяем полученные файлы в указанный ф-л
  .pipe(autoprefixer({ //pipe пишем после объединения тк с одним ф-м работать проще
    cascade: false
  }))
  .pipe(cleanCSS({
    level: 2
  }))
  .pipe(dest('dist')) //указываем дирректория для записи файла
  .pipe(browserSync.stream())//получаем все изменения файлов которые будут происходить
}

const stylesDev = () => {
  return src('src/styles/**/*.css') //получаем ф-лф из папки и ф-лов
  .pipe(sourcemaps.init())//инициализируем sourcemaps
  .pipe(concat('main.css')) // объединяем полученные файлы в указанный ф-л
  .pipe(autoprefixer({ //pipe пишем после объединения тк с одним ф-м работать проще
    cascade: false
  }))
  .pipe(sourcemaps.write())//записываем рузельтат sourcemaps
  .pipe(dest('dist')) //указываем дирректория для записи файла
  .pipe(browserSync.stream())//получаем все изменения файлов которые будут происходить
}

//ф-я HTMLmin
const htmlDiv = () => {
  return src('src/**/*.html')
    .pipe(dest('dist'))
    .pipe(browserSync.stream())//получаем все изменения файлов которые будут происходить
}

const htmlMinify = () => {
  return src('src/**/*.html')
    .pipe(htmlMin({
      collapseWhitespace: true, //указываем параметры
    }))
    .pipe(dest('dist'))
    .pipe(browserSync.stream())//получаем все изменения файлов которые будут происходить
}

//ф-я svg спрайта
const svgSprites = () => {
  return src('src/img/svg/**/*.svg')
    .pipe(svgSprite({
      mode: {
        stack: {
          sprite: '../sprite.svg'
        }
      }
    }))
    .pipe(dest('dist/img'))
}

const scripts = () => {
  return src([
      'src/js/components/**/*.js',
      'src/js/main.js'
    ])
    .pipe(babel({
      presets: ['@babel/env']
    }))
    .pipe(concat('app.js'))
    .pipe(uglify().on('error', notify.onError()))//в сулчае ошибки -извещение
    .pipe(dest('dist'))
    .pipe(browserSync.stream())//автоматическая перехагрузка
}

const scriptsDev = () => {
  return src([
      'src/js/components/**/*.js',
      'src/js/main.js'
    ])
    .pipe(sourcemaps.init())//инициализируем sourcemaps
    .pipe(concat('app.js'))
    .pipe(notify())//в сулчае ошибки -извещение
    .pipe(sourcemaps.write())//записываем рузельтат sourcemaps
    .pipe(dest('dist'))
    .pipe(browserSync.stream())//автоматическая перехагрузка
}

const images = () => {
  return src([
    'src/img/**/*.jpg',
    'src/img/**/*.png',
    'src/img/*.svg', // убрали две звездочки чтобы не было кализий */
    'src/img/**/*.jpeg',
  ], {
    encoding: false//Если false, содержимое файла рассматривается как двоичное. Если это строка, это используется как кодировка текста.
})
  .pipe(imagen())
  .pipe(dest('dist/img'))
}

//ф-я просмотра файлов (локальный сервер). она ничего не возвращаяет
const watchFiles = () => {
  browserSync.init({//init инциализирует наш сервер
    server: {
      baseDir: 'dist'
    }
  })
}

//следим за изменение наших файлов
//первый аргумент за чем следим
//второй -что будем делать
watch('src/**/*.html', htmlDiv)
watch('src/styles/**/*.css', stylesDev)
watch('src/img/svg/**/*.svg', svgSprites)
watch('src/js/**/*.js', scriptsDev)
watch('src/recources/**', recources)//обязательно отстелживаем

//экспорт gulp task, что бы запуускать с помощью gulp  нашу ф-ю
exports.styles = styles;
exports.stylesDev = stylesDev;
exports.scriptsDev = scriptsDev;
exports.scripts = scripts;
exports.htmlDiv = htmlDiv;
exports.htmlMinify = htmlMinify;
exports.watchFiles = watchFiles;
exports.dev = series(cleaner, recources, htmlDiv, scriptsDev, stylesDev, images, svgSprites, watchFiles) //Dev таск в котором перечисляются таски и зап-я
exports.default = series(cleaner, recources, htmlMinify, scripts, styles, images, svgSprites, watchFiles) //дефолтный таск в котором перечисляются таски и зап-я
