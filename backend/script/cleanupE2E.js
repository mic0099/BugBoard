import { Op } from "sequelize";

import {
  database,
  User,
  Project,
  Issue,
  Comment,
  Tag,
  Image,
  RefreshToken
} from "../models/Database.js";

async function cleanupE2E() {

  const transaction = await database.transaction();

  try {

    console.log("\n=== E2E CLEANUP STARTED ===\n");

    // ==========================================
    // ISSUE E2E
    // ==========================================

    const e2eIssues = await Issue.findAll({
      attributes: ["issueId"],
      where: {
        title: {
          [Op.like]: "issue-E2E%"
        }
      },
      transaction
    });

    const issueIds = e2eIssues.map(
      issue => issue.issueId
    );

    if (issueIds.length > 0) {

      await Image.destroy({
        where: {
          issueId: {
            [Op.in]: issueIds
          }
        },
        transaction
      });

      await Comment.destroy({
        where: {
          issueId: {
            [Op.in]: issueIds
          }
        },
        transaction
      });

      await database.query(
        `
        DELETE FROM IssueTags
        WHERE issueId IN (:issueIds)
        `,
        {
          replacements: { issueIds },
          transaction
        }
      );

      await Issue.destroy({
        where: {
          issueId: {
            [Op.in]: issueIds
          }
        },
        transaction
      });

      console.log(
        `Deleted ${issueIds.length} E2E issue(s)`
      );
    }

    // ==========================================
    // PROJECT E2E
    // ==========================================

    const e2eProjects = await Project.findAll({
      attributes: ["projectId"],
      where: {
        name: {
          [Op.like]: "project-test-E2E%"
        }
      },
      transaction
    });

    const projectIds = e2eProjects.map(
      project => project.projectId
    );

    if (projectIds.length > 0) {

      await database.query(
        `
        DELETE FROM UserProjects
        WHERE projectId IN (:projectIds)
        `,
        {
          replacements: { projectIds },
          transaction
        }
      );

      await Project.destroy({
        where: {
          projectId: {
            [Op.in]: projectIds
          }
        },
        transaction
      });

      console.log(
        `Deleted ${projectIds.length} E2E project(s)`
      );
    }

    // ==========================================
    // TAG E2E
    // ==========================================

    const deletedTags = await Tag.destroy({
      where: {
        content: {
          [Op.like]: "test-tag%"
        }
      },
      transaction
    });

    console.log(
      `Deleted ${deletedTags} E2E tag(s)`
    );

    // ==========================================
    // USER E2E
    // Pattern:
    // test<timestamp>@test.com
    // ==========================================

    const e2eUsers = await User.findAll({
      attributes: ["userId"],
      where: {
        email: {
          [Op.like]: "test%@test.com"
        }
      },
      transaction
    });

    const userIds = e2eUsers.map(
      user => user.userId
    );

    if (userIds.length > 0) {

      await RefreshToken.destroy({
        where: {
          userId: {
            [Op.in]: userIds
          }
        },
        transaction
      });

      await User.destroy({
        where: {
          userId: {
            [Op.in]: userIds
          }
        },
        transaction
      });

      console.log(
        `Deleted ${userIds.length} E2E user(s)`
      );
    }

    await transaction.commit();

    console.log(
      "\n=== E2E CLEANUP COMPLETED SUCCESSFULLY ===\n"
    );

    process.exit(0);

  } catch (error) {

    await transaction.rollback();

    console.error(
      "\n=== E2E CLEANUP FAILED ===\n",
      error
    );

    process.exit(1);
  }
}

cleanupE2E();