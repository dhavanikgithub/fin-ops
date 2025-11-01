import React from 'react';
import { ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight } from 'lucide-react';
import '../styles/Pagination.scss';

interface PaginationProps {
    currentPage?: number;
    totalPages?: number;
    totalItems?: number;
    itemsPerPage?: number;
    onPageChange?: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
    currentPage = 1,
    totalPages = 25,
    totalItems = 248,
    itemsPerPage = 10,
    onPageChange
}) => {
    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);

    const handlePageChange = (page: number) => {
        if (onPageChange) {
            onPageChange(page);
        }
    };

    const renderPageNumbers = () => {
        const pages = [];

        // Always show first page
        pages.push(
            <button
                key={1}
                className={`pagination__page-number ${currentPage === 1 ? 'pagination__page-number--active' : ''}`}
                onClick={() => handlePageChange(1)}
            >
                1
            </button>
        );

        // Show current page and neighbors if not at the beginning
        if (currentPage > 3) {
            pages.push(
                <span key="ellipsis1" className="pagination__page-number">
                    ...
                </span>
            );
        }

        // Show pages around current page
        for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
            pages.push(
                <button
                    key={i}
                    className={`pagination__page-number ${currentPage === i ? 'pagination__page-number--active' : ''}`}
                    onClick={() => handlePageChange(i)}
                >
                    {i}
                </button>
            );
        }

        // Show ellipsis before last page if needed
        if (currentPage < totalPages - 2) {
            pages.push(
                <span key="ellipsis2" className="pagination__page-number">
                    ...
                </span>
            );
        }

        // Always show last page if more than 1 page
        if (totalPages > 1) {
            pages.push(
                <button
                    key={totalPages}
                    className={`pagination__page-number ${currentPage === totalPages ? 'pagination__page-number--active' : ''}`}
                    onClick={() => handlePageChange(totalPages)}
                >
                    {totalPages}
                </button>
            );
        }

        return pages;
    };

    return (
        <div className="pagination">
            <div className="pagination__info">
                <span className="pagination__highlight">{startItem} - {endItem}</span>
                <span>of</span>
                <span className="pagination__highlight">{totalItems}</span>
            </div>

            <div className="pagination__controls">
                <button
                    className="pagination__button"
                    onClick={() => handlePageChange(1)}
                    disabled={currentPage === 1}
                >
                    <ChevronsLeft size={16} />
                </button>

                <button
                    className="pagination__button"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                >
                    <ChevronLeft size={16} />
                </button>

                {renderPageNumbers()}

                <button
                    className="pagination__button"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                >
                    <ChevronRight size={16} />
                </button>

                <button
                    className="pagination__button"
                    onClick={() => handlePageChange(totalPages)}
                    disabled={currentPage === totalPages}
                >
                    <ChevronsRight size={16} />
                </button>
            </div>
        </div>
    );
};

export default Pagination;