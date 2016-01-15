import test from 'ava';
import pify from 'aws-lambda-pify';
import index from './fixtures/lambda';
import m from './';

const fn = pify(index.handler);

const fixture = {
	'http-method': 'POST',
	'resource-path': '/test',
	'body': {
		foo: 'bar'
	},
	'query': {
		hello: 'world'
	}
};

test.beforeEach(t => {
	t.context.app = m();
});

test('create', t => {
	t.is(t.context.app.constructor, m);
	t.same(t.context.app._middleware, []);
});

test('create context throws error if no http-method is provided', t => {
	const app = t.context.app;
	t.throws(app.createContext.bind(app, {}), 'No http-method provided.');
});

test('create context throws error if no resource-path is provided', t => {
	const app = t.context.app;
	t.throws(app.createContext.bind(app, {'http-method': 'GET'}), 'No resource-path provided.');
});

test('create context', t => {
	const ctx = t.context.app.createContext(fixture);

	t.same(ctx, {
		req: fixture,
		method: 'POST',
		path: '/test',
		request: {
			body: fixture.body,
			query: fixture.query
		}
	});
});

test('return undefined if the body is not set', async t => {
	t.notOk(await fn(fixture));
});

test('return the body', async t => {
	t.is(await fn({'http-method': 'GET', 'resource-path': '/foo'}), 'Bar');
});

test('resolves body if it is a promise', async t => {
	t.is(await fn({'http-method': 'GET', 'resource-path': '/foo-bar'}), 'Foo Bar');
});

test('chain middlewares', async t => {
	t.is(await fn({'http-method': 'GET', 'resource-path': '/foo-bar-baz'}), 'Foo Bar Baz');
});