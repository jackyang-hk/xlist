/**
 * @fileoverview
 * @author
 * @module xlist
 **/
KISSY.add(function (S, Node,Base) {
    var EMPTY = '';
    var $ = Node.all;
    /**
     *
     * @class Xlist
     * @constructor
     * @extends Base
     */
    function Xlist(comConfig) {
        var self = this;
        //调用父类构造函数
        Xlist.superclass.constructor.call(self, comConfig);
    }
    S.extend(Xlist, Base, /** @lends Xlist.prototype*/{

    }, {ATTRS : /** @lends Xlist*/{

    }});
    return Xlist;
}, {requires:['node', 'base']});



