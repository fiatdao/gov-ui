import React from 'react';
import { ColumnsType } from 'antd/lib/table/interface';
import BigNumber from 'bignumber.js';
import { formatBigValue, getEtherscanAddressUrl, shortenAddr } from 'web3/utils';

import Modal, { ModalProps } from 'components/antd/modal';
import Table from 'components/antd/table';
import Tabs from 'components/antd/tabs';
import ExternalLink from 'components/custom/externalLink';
import Grid from 'components/custom/grid';
import Identicon from 'components/custom/identicon';
import { Text } from 'components/custom/typography';
import { APIVoteEntity } from 'modules/senatus/api';

import AbrogationVotersProvider, { useAbrogationVoters } from '../../providers/AbrogationVotersProvider';

import s from './s.module.scss';

const Columns: ColumnsType<APIVoteEntity> = [
  {
    title: 'Address',
    dataIndex: 'address',
    width: '35%',
    render: (address: string) => (
      <Grid flow="col" gap={8} align="center">
        <Identicon address={address} width={32} height={32} />
        <ExternalLink href={getEtherscanAddressUrl(address)}>
          <Text type="p1" weight="semibold" color="blue">
            {shortenAddr(address)}
          </Text>
        </ExternalLink>
      </Grid>
    ),
  },
  {
    title: 'Votes',
    dataIndex: 'power',
    width: '38%',
    align: 'right',
    render: (power: BigNumber) => (
      <Text type="p1" weight="semibold" color="primary" className={s.powerCell}>
        {formatBigValue(power, 0)}
      </Text>
    ),
  },
  {
    title: 'Vote type',
    dataIndex: 'support',
    width: '27%',
    render: (support: boolean) =>
      support ? (
        <div className={s.forTag}>
          <Text type="lb2" weight="semibold" textGradient="var(--gradient-green)" color="var(--gradient-green-safe)">
            For
          </Text>
        </div>
      ) : (
        <div className={s.againstTag}>
          <Text type="lb2" weight="semibold" textGradient="var(--gradient-red)" color="var(--gradient-red-safe)">
            Against
          </Text>
        </div>
      ),
  },
];

export type AbrogationVotersModalProps = ModalProps;

const AbrogationVotersModalInner: React.FC<AbrogationVotersModalProps> = props => {
  const { ...modalProps } = props;

  const abrogationVotesCtx = useAbrogationVoters();

  function handleStateChange(stateFilter: string) {
    if (stateFilter === 'for') {
      abrogationVotesCtx.changeSupportFilter(true);
    } else if (stateFilter === 'against') {
      abrogationVotesCtx.changeSupportFilter(false);
    } else {
      abrogationVotesCtx.changeSupportFilter(undefined);
    }
  }

  function handlePaginationChange(page: number) {
    abrogationVotesCtx.changePage(page);
  }

  return (
    <Modal className={s.component} width={620} {...modalProps}>
      <Tabs className={s.tabs} defaultActiveKey="all" onChange={handleStateChange}>
        <Tabs.Tab key="all" tab="All Votes" />
        <Tabs.Tab key="for" tab="For" />
        <Tabs.Tab key="against" tab="Against" />
      </Tabs>
      <Table<APIVoteEntity>
        className={s.table}
        columns={Columns}
        dataSource={abrogationVotesCtx.votes}
        rowKey="address"
        loading={abrogationVotesCtx.loading}
        locale={{
          emptyText: 'No votes',
        }}
        pagination={{
          total: abrogationVotesCtx.total,
          current: abrogationVotesCtx.page,
          pageSize: abrogationVotesCtx.pageSize,
          position: ['bottomRight'],
          showTotal: (total: number, [from, to]: [number, number]) => (
            <Text type="p2" weight="semibold" color="secondary">
              Showing {from} to {to} out of {total} votes
            </Text>
          ),
          onChange: handlePaginationChange,
        }}
      />
    </Modal>
  );
};

const AbrogationVotersModal: React.FC<AbrogationVotersModalProps> = props => (
  <AbrogationVotersProvider>
    <AbrogationVotersModalInner {...props} />
  </AbrogationVotersProvider>
);
export default AbrogationVotersModal;
