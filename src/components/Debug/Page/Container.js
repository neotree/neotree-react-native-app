import React from 'react';
import PropTypes from 'prop-types';
import Overlay from '@/ui/Overlay';
import { LayoutContainer, LayoutBody, LayoutScrollableContent, LayoutCard } from '@/components/Layout';

const Container = ({ children }) => {
  return (
    <>
      <Overlay color="#fff">
        <LayoutContainer>
          <LayoutBody>
            <LayoutScrollableContent>
              <LayoutCard>
                {children}
              </LayoutCard>
            </LayoutScrollableContent>
          </LayoutBody>
        </LayoutContainer>
      </Overlay>
    </>
  );
};

Container.propTypes = {
  children: PropTypes.node
};

export default Container;
