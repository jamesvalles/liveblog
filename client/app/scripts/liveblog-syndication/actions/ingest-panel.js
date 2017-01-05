liveblogSyndication
    .factory('IngestPanelActions', ['Dispatcher', 'api', '$http', 'config', 'moment',
        function(Dispatcher, api, $http, config, moment) {
            return {
                getSyndication: function(consumerBlogId) {
                     var params = {
                        where: {
                            blog_id: consumerBlogId
                        }
                    };

                    api.syndicationIn.query(params).then(function(syndicationIn) {
                        Dispatcher.dispatch({
                            type: 'ON_GET_SYND',
                            syndicationIn: syndicationIn
                        });
                    })
                    .catch(function(error) {
                        Dispatcher.dispatch({
                            type: 'ON_ERROR',
                            error: error
                        });
                    });

                },
                getProducers: function() {
                    api.producers.query().then(function(producers) {
                        Dispatcher.dispatch({
                            type: 'ON_GET_PRODUCERS',
                            producers: producers
                        });
                    })
                    .catch(function(error) {
                        Dispatcher.dispatch({
                            type: 'ON_ERROR',
                            error: error
                        });
                     });
                },
                syndicate: function(params) {
                    var uri = config.server.url + 
                        '/producers/' + params.producerId + 
                        '/syndicate/' + params.producerBlogId;

                    var startDate = moment()
                        .subtract(14, 'd')
                        .format('YYYY-MM-DDTHH:MM:ss+00:00');

                    return $http({
                        url: uri,
                        method: (params.method == 'DELETE') ? 'DELETE' : 'POST',
                        data: { 
                            start_date: startDate,
                            consumer_blog_id: params.consumerBlogId, 
                            auto_publish: params.autoPublish,
                            auto_retrieve: params.autoRetrieve
                        },
                        headers: {
                            "Content-Type": "application/json;charset=utf-8"
                        }
                    })
                    .then(function(response) {
                        return api('syndication_in').query();
                    })
                    .then(function(syndicationIn) {
                        Dispatcher.dispatch({
                            type: 'ON_GET_SYND',
                            syndicationIn: syndicationIn
                        });
                    })
                    .catch(function(error) {
                        Dispatcher.dispatch({
                            type: 'ON_ERROR',
                            error: error
                        });
                    });
                },
                getProducerBlogs: function(producerId) {
                    api.get('/producers/' + producerId + '/blogs')
                        .then(function(blogs) {
                            Dispatcher.dispatch({
                                type: 'ON_GET_PRODUCER_BLOGS',
                                producerBlogs: blogs
                            });
                        })
                        .catch(function(error) {
                            Dispatcher.dispatch({
                                type: 'ON_ERROR',
                                error: error
                            });
                        });
                },
                toggleModal: function(value) {
                    Dispatcher.dispatch({
                        type: 'ON_TOGGLE_MODAL',
                        modalActive: value
                    });
                },
                updateSyndication: function(syndId, data, etag) {
                    return $http({
                        url: config.server.url + '/syndication_in/' + syndId,
                        method: 'PATCH',
                        data: data,
                        headers: {
                            "Content-Type": "application/json;charset=utf-8",
                            "If-Match": etag
                        }
                    })
                    .then(function(response) {
                        Dispatcher.dispatch({
                            type: 'ON_UPDATED_SYND',
                            syndEntry: response.data
                        });
                    });
                },
                flushErrors: function() {
                    Dispatcher.dispatch({
                        type: 'ON_ERROR',
                        error: null
                    });
                }
            };
        }])

