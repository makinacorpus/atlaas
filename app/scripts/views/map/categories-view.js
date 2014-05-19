/*global atlaas, Backbone, JST*/

atlaas.Views.Map = atlaas.Views.Map || {};

(function () {
    'use strict';

    atlaas.Views.Map.CategoriesView = Backbone.View.extend({
        events: {
            'click .submenu__item.category' : 'clickHandler',
            'click .submenu__item--back'    : 'closeMenu',
        },

        initialize: function (options) {
            this.options = options || {};

            this.categorieViewCollection = [];
            this.selectedCategories = {};
            this.$categoriesContainer   = this.$el.find('.menu-categories__wrapper');

            var query = {
                source: JSON.stringify({
                    size: 50,
                    query: {
                        match_all: {}
                    }
                })
            };

            this.listenTo(this.collection, "reset", this.render);
            this.collection.fetch({ reset: true, data: query });

            $(window).on('resize', _.bind(function () {
                // Fix max-height to have a scrollbar for overflow
                this.$el.find('div').css('max-height', atlaas.height - this.$el.offset().top - 60);
            }, this));
        },

        render: function () {
        	this.categorieViewCollection = _.map(this.collection.models, function (model) {
        		return new atlaas.Views.Map.CategorieView({ model: model });
        	});

        	this.$categoriesContainer.append(_.map(this.categorieViewCollection, function (categorie) {
        		return categorie.render().el;
        	}));
        },

        clickHandler: function (e) {
            e.preventDefault();

            var $item = $(e.target);

            if (!$item.hasClass('active')) {
                this.selectedCategories = {
                    type: $item.data('type'),
                    id: $item.attr('href'),
                    name: $item.text()
                }
            }

            this.openMenu(e);

            this.trigger('selected');
        },

        openMenu: function (e) {
            var $item = $(e.currentTarget),
            $currentSubmenu = $item.parents('ul').eq(0),
            $newSubmenu = $item.siblings('ul');

            if (!$item.hasClass('active')) {
                $currentSubmenu.add($newSubmenu).find('.active').removeClass('active');
                $item.addClass('active');
            }
            
            if ($newSubmenu.length == 0) return;

            e.preventDefault();

            if (TweenLite.getTweensOf(this.$menuWrapper).length != 0) return;

            var $menuIn = $newSubmenu.clone().addClass('in').appendTo(this.$el);


            // Set back button label with selected category
            $newSubmenu.add($menuIn).find('.submenu__item--back').text($item.text());
            
            var tweenOut = TweenLite.to(this.$categoriesContainer, 0.4,
                { 'x': '-220px',
                'z': '10px',
                'opacity': '0',
                ease: Power2.easeInOut,
                onComplete: function () {
                    tweenOut.seek(0);
                    tweenOut.pause();
                    tweenOut.kill();
                } 
            });

            TweenLite.fromTo($menuIn, 0.4,
                { 'x': '220px',
                'opacity': '0'},
                { 'x': '0px',
                'opacity': '1',
                ease: Power2.easeInOut,
                onComplete: function () {
                    $currentSubmenu.parent('li').removeClass('subviewopen').addClass('subview');
                    $currentSubmenu.addClass('subview');
                    $item.parent().addClass('subviewopen');
                    $menuIn.remove();
                }
            });
        },

        closeMenu: function (e) {
            var $item = $(e.currentTarget),
            $currentSubmenu = $item.closest('ul'),
            $parentMenu = $currentSubmenu.parent().closest('ul');

            e.preventDefault();

            if (TweenLite.getTweensOf(this.$menuWrapper).length != 0) return;

            var $menuIn = $parentMenu.clone().addClass('in').removeClass('subview').addClass('subviewopen').appendTo(this.$el);

            var tweenOut = TweenLite.to(this.$categoriesContainer, 0.4,
                { 'x': '220px',
                'opacity': '0',
                ease: Power2.easeInOut,
                onComplete: function () {
                    tweenOut.seek(0);
                    tweenOut.pause();
                    tweenOut.kill();
                }
            });

            TweenLite.fromTo($menuIn, 0.4,
                { 'x': '-220px',
                'opacity': '0'},
                { 'x': '0px',
                'opacity': '1',
                ease: Power2.easeInOut,
                onComplete: function () {
                    $parentMenu.removeClass('subview');
                    $('.subviewopen').removeClass('subviewopen');
                    $parentMenu.parent('li').removeClass('subview').addClass('subviewopen');
                    $menuIn.remove();
                }
            });
        },

        open: function () {
            this.$el.show();

            TweenLite.fromTo(this.$el, 0.4,
                { 'x': '100px',
                'opacity': '0'},
                { 'x': '0',
                'opacity': '1',
                ease: Power2.easeInOut
            });

            // Fix max-height to have a scrollbar for overflow
            this.$el.find('div').css('max-height', atlaas.height - this.$el.offset().top - 60);
        },

        close: function () {
            TweenLite.to(this.$el, 0.4,
                { 'x': '100px',
                'opacity': '0',
                ease: Power2.easeInOut,
                onComplete: function () {
                    this.$el.hide();
                },
                onCompleteScope: this
            });
        },

        reset: function () {
            this.$el.find('.active').removeClass('active');
        }
    });



    atlaas.Views.Map.CategorieView = Backbone.View.extend({
        
        tagName: 'li',

        template: JST['app/scripts/templates/categorie-view.ejs'],

        initialize: function () {
            console.log(this.model.toJSON());
        },

        render: function () {
            this.$el.html(this.template(this.model.toJSON()));

            return this;
        }
    });

})();
