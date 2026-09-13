import {
  createBuilder,
  HttpCommandResultMode,
  InputType,
} from './.aspire/modules/aspire.mjs';

const builder = await createBuilder();

const adminPassword = await builder.addParameter('admin-password', { secret: true });

const cache = await builder.addRedis('cache');

const postgres = await builder
  .addPostgres('postgres')
  .withDataVolume();
const db = await postgres.addDatabase('db');

const migrations = await builder
  .addProject('migrations', '../../../start/src/BingoBoard.MigrationService/BingoBoard.MigrationService.csproj')
  .withEnvironment('Authentication__AdminPassword', adminPassword)
  .withReference(db)
  .waitFor(db);

const admin = await builder
  .addProject('boardadmin', '../../../start/src/BingoBoard.Admin/BingoBoard.Admin.csproj')
  .withEnvironment('Authentication__AdminPassword', adminPassword)
  .withReference(cache)
  .withReference(db)
  .waitFor(cache)
  .waitForCompletion(migrations)
  .withExternalHttpEndpoints()
  .withIconName('Trophy')
  .withUrl('/', { displayText: 'Admin home' })
  .withUrl('/board-management', { displayText: 'Manage board' })
  .withUrl('/squares-management', { displayText: 'Manage squares' })
  .withHttpCommand(
    '/api/demo/producer/squares/import',
    'Add bingo square',
    {
      commandName: 'add-bingo-square',
      methodName: 'POST',
      description: "Add or update a square through the admin application's developer API.",
      confirmationMessage: 'Add this square to the bingo board?',
      iconName: 'AddSquare',
      isHighlighted: true,
      resultMode: HttpCommandResultMode.Auto,
      prepareRequest: async (context) => {
        const args = await context.arguments();

        return {
          content: JSON.stringify([
            {
              id: await args.requiredValue('id'),
              label: await args.requiredValue('label'),
              type: await args.value('category'),
              isActive: true,
            },
          ]),
          contentType: 'application/json',
        };
      },
      commandOptions: {
        arguments: [
          {
            name: 'id',
            label: 'Square ID',
            inputType: InputType.Text,
            required: true,
            maxLength: 100,
          },
          {
            name: 'label',
            label: 'Square text',
            inputType: InputType.Text,
            required: true,
            maxLength: 200,
          },
          {
            name: 'category',
            label: 'Category',
            inputType: InputType.Text,
            value: 'workshop',
            maxLength: 50,
          },
        ],
      },
    },
  );

await builder
  .addViteApp('bingoboard', '../../../start/src/bingo-board')
  .withEnvironment('BINGO_ADMIN_URL', await admin.getEndpoint('http'))
  .withReference(admin)
  .withUrl('/', { displayText: 'Play bingo' })
  .waitFor(admin);

await builder.build().run();
