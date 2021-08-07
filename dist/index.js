"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _typeof2 = _interopRequireDefault(require("@babel/runtime/helpers/typeof"));

var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _sequelize = require("sequelize");

var _discord = require("discord.js");

var _lotus = _interopRequireWildcard(require("./config/lotus.json"));

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || (0, _typeof2["default"])(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

var sequelize = new _sequelize.Sequelize(_lotus.sequelize);
var client = new _discord.Client({
  intents: _lotus.discord.intents.map(function (i) {
    return _discord.Intents.FLAGS[i];
  })
});
var commands = new Map();
var modules = new Map();
var config = {};
var global = {
  sequelize: sequelize,
  client: client,
  commands: commands,
  config: config,
  modules: modules,
  configFile: _lotus["default"]
};
var eventModules = {};

function start() {
  return _start.apply(this, arguments);
}

function _start() {
  _start = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee2() {
    var _loop, _i3, _Object$entries3;

    return _regenerator["default"].wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            _context2.next = 2;
            return Promise.all(_lotus.packages.map( /*#__PURE__*/function () {
              var _ref = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee(pName) {
                var packageObj, module, _i, _Object$entries, _Object$entries$_i, name, fn, _i2, _Object$entries2, _Object$entries2$_i, _name, command;

                return _regenerator["default"].wrap(function _callee$(_context) {
                  while (1) {
                    switch (_context.prev = _context.next) {
                      case 0:
                        _context.next = 2;
                        return Promise.resolve("".concat(pName)).then(function (s) {
                          return _interopRequireWildcard(require(s));
                        });

                      case 2:
                        packageObj = _context.sent;
                        module = {
                          name: pName,
                          commandNames: [],
                          enabled: {},
                          config: packageObj.config
                        };

                        for (_i = 0, _Object$entries = Object.entries(packageObj.events); _i < _Object$entries.length; _i++) {
                          _Object$entries$_i = (0, _slicedToArray2["default"])(_Object$entries[_i], 2), name = _Object$entries$_i[0], fn = _Object$entries$_i[1];
                          if (!eventModules[name]) eventModules[name] = [fn];else eventModules[name].push(fn);
                        }

                        for (_i2 = 0, _Object$entries2 = Object.entries(packageObj.commands); _i2 < _Object$entries2.length; _i2++) {
                          _Object$entries2$_i = (0, _slicedToArray2["default"])(_Object$entries2[_i2], 2), _name = _Object$entries2$_i[0], command = _Object$entries2$_i[1];
                          command.moduleName = pName;
                          command.name = _name;
                          command.enabled = {};
                          commands.set(_name, command);
                          module.commandNames.push(_name);
                        }

                        modules.set(pName, module);

                      case 7:
                      case "end":
                        return _context.stop();
                    }
                  }
                }, _callee);
              }));

              return function (_x) {
                return _ref.apply(this, arguments);
              };
            }()));

          case 2:
            _loop = function _loop() {
              var _Object$entries3$_i = (0, _slicedToArray2["default"])(_Object$entries3[_i3], 2),
                  eventName = _Object$entries3$_i[0],
                  events = _Object$entries3$_i[1];

              client.on(eventName, function () {
                for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
                  args[_key] = arguments[_key];
                }

                return events.forEach(function (item) {
                  return item.apply(void 0, [global].concat(args));
                });
              });
            };

            for (_i3 = 0, _Object$entries3 = Object.entries(eventModules); _i3 < _Object$entries3.length; _i3++) {
              _loop();
            }

            client.once('ready', function () {
              console.log('Discord bot started!');
            });
            client.login(_lotus.discord.token);

          case 6:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2);
  }));
  return _start.apply(this, arguments);
}

start();